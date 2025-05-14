"use client"
import React, {useEffect, useState, useMemo, useRef} from 'react';
import Header from "@/components/bids/header/header";
import LoadingPage from "@/components/UI/LoadingPage";
import {useSession} from "next-auth/react";
import Modal from "@/components/bids/UI/Modal";
import {ImBin, ImPrinter} from "react-icons/im";
import FilterableTable from "@/components/jewelry/products/table/FilterableTable";
import ReactToPrint from 'react-to-print';
import Barcode from 'react-barcode';
import ProductPrintable from "@/components/UI/ProductPrintable";

function Page() {
    const {data: session} = useSession();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const componentRefs = useRef([]);
    const [formData, setFormData] = useState({
        CompanyName: '', name: '', location: ''
    });
    const componentRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/products/gets?userId=${session.user.id}`);
                    const response2 = await fetch(`/api/register/getUser?userId=${session.user.id}`);
                    const userData = await response2.json();

                    setFormData({
                        location: userData.location || '',
                        CompanyName: userData.CompanyName || '',
                        name: userData.name || ''
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    if (!Array.isArray(data)) {
                        throw new Error('Data is not an array');
                    }
                    setProducts(data);
                } catch (error) {
                    console.error('Error fetching products:', error);
                    setError(error.message);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();


    }, [session]);


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} à ${hours}:${minutes}`;
    };

    const columns = useMemo(() => [
        {Header: "Code", accessor: "code"},
        { Header: "Modèle", accessor: "model", Cell: ({ value }) => (value ? value : '-') },
        { Header: "Provenance", accessor: "origin", Cell: ({ value }) => (value ? value : '-') },
        { Header: "Carat", accessor: "carat", Cell: ({ value }) => (value ? value : '-') },
        {
            Header: "Poids",
            accessor: "weight",
            Cell: ({ value }) => (value ? <>{value}g</> : '-')
        },
        {
            Header: "Date Création", accessor: "createdAt", Cell: ({value}) => (<>{formatDate(value)}</>)
        },
        {
            Header: "Date Modification", accessor: "updatedAt", Cell: ({value}) => (<>{formatDate(value)}</>)
        },
        {
            Header: "État",
            accessor: "status",
            Cell: ({row}) => (<div className="flex gap-1">{row.original.status === "Active" &&
                <span
                    className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-green-400">Disponible</span>

            }
                {row.original.status === 'Lend' &&
                    <span
                        className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-yellow-300">Prêter</span>
                }
                {row.original.status === 'Sold' &&
                    <span
                        className="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-indigo-400">Vendu</span>

                }
                {row.original.status === 'Crédit' &&
                    <span
                        className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-purple-400">Crédit</span>

                }
                {row.original.status === 'Facilité' &&
                    <span
                        className="bg-pink-100 text-pink-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-pink-400">Facilité</span>

                }
                {row.original.status === 'deleted' &&
                    <span
                        className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-red-400">Supprimé</span>

                }
            </div>)
        },
        {
            Header: "Affectation",
            accessor: "affectation",
            Cell: ({ row }) => (
                <>
                    {row.original.status !== "deleted" ? (
                        <>
                            {row.original.Jeweler && <>{row.original.Jeweler.name}</>}
                            {row.original.Guarantee && <>{row.original.Guarantee.formattedGuaranteeId}</>}
                            {!row.original.Jeweler && !row.original.Guarantee && <>-</>}
                        </>
                    ) : (
                        <>-</> // Fallback if status is not "deleted"
                    )}
                </>
            )
        },{
            Header: "Action",
            accessor: "action",
            Cell: ({row}) => {
                const productRef = useRef();
                componentRefs.current[row.original.id] = productRef;

                return (
                    <>
                        {row.original.status === 'deleted' ?'-' : (
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4
                                focus:outline-none focus:ring-red-300 font-medium rounded-lg
                                text-sm px-5 py-2.5 text-center me-2 mb-2"
                                    onClick={() => handleStartAdding(row.original.id)}
                                >
                                    <ImBin />
                                </button>
                                <div>
                                    <ReactToPrint
                                        trigger={() => (
                                            <button
                                                type="button"
                                                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                            >
                                                <ImPrinter />
                                            </button>
                                        )}
                                        content={() => productRef.current}
                                    />
                                    <ProductPrintable dataProduct={row.original} componentRef={productRef} formData={formData} />
                                </div>
                            </div>
                        )}
                    </>
                );
            },
        }
    ], [formData]);


    function handleStartAdding(id) {
        setSelectedProductId(id);
        setPassword(null);
        setModalIsOpen(true);
    }


    async function handleDelete(id) {

        try {

            const passwordCheckResponse = await fetch('/api/auth/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    password: password,
                }),
            });

            const passwordCheckResult = await passwordCheckResponse.json();

            if (!passwordCheckResponse.ok || !passwordCheckResult.success) {
                throw new Error('Mot de passe incorrect');
            }

            setLoading(true);
            const response = await fetch(`/api/products/delete?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                window.location.reload();
                const updatedAuctions = products.filter(auction => auction.id !== id);
                setProducts(updatedAuctions);
                handleStopAdding();

            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error deleting auction:', error);
            setConfirmError(error.message);
            setLoading(false);
        }
    }

    function handleStopAdding() {
        setModalIsOpen(false);
    }


    if (isLoading) {
        return <LoadingPage/>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <Header title="Liste des produits"/>
            <div className="flex flex-col p-4 ">

                <FilterableTable columns={columns} data={products}/>
            </div>


            <Modal open={modalIsOpen} onClose={handleStopAdding}>

                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={handleStopAdding}
                            className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900
                         rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                            data-modal-hide
                                ="popup-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500"> Es-tu sûr ?</h1>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment
                            supprimer
                            cette
                            produit ?</h3>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 rounded w-full  outline-none focus-within:border-blue-700  focus:ring-blue-500 "
                        />
                        {confirmError && (

                            <div
                                className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 mb-2 p-1 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                     fill="none"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p className="text-center">{confirmError}
                                </p>
                            </div>
                        )}
                        <button data-modal-hide="popup-modal" type="submit"
                                onClick={() => handleDelete(selectedProductId)} disabled={loading}
                                className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleStopAdding}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >No,
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>

        </>
    );
}

export default Page;
