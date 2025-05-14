"use client"
import React, {useEffect, useMemo, useState} from 'react';
import Header from "@/components/bids/header/header";
import {useSession} from "next-auth/react";
import {ImBin, ImEye} from "react-icons/im";
import LoadingPage from "@/components/UI/LoadingPage";
import Modal from "@/components/bids/UI/Modal";
import FilterableTable from "@/components/jewelry/suppliers/FilterableTable";
import {FaEye, FaEyeSlash} from "react-icons/fa";

function Page() {
    const {data: session} = useSession();
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSupplierId, setSelectedSupplierId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [loading, setLoading] = useState(false);

    const columns = useMemo(() => [
        {Header: "Code Fournisseur", accessor: "formattedSupplierId"},
        {
            Header: "Nom Fournisseur", accessor: "name", Cell: ({value}) => {
                return value ? <>{value}</> : <div className="text-3xl">-</div>
            }
        },
        {
            Header: "Contact", accessor: "contact", Cell: ({value}) => {
                return value ? <>{value}</> : <div className="text-3xl">-</div>
            }
        },
        {
            Header: "Date de création", accessor: "createdAt", Cell: ({value}) => {
                const date = new Date(value);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return <>{day}-{month}-{year}</>;
            }
        },
        {
            Header: "Prix", accessor: "price",
            Cell: ({value}) => (value ? value : <>0</>),
        },
        {
            Header: "Avance", accessor: "advance",
            Cell: ({value}) => (value ? value : <>0</>),
        }, {
            Header: "Restant",
            accessor: "remaining",
            Cell: ({row}) => {
                const price = row.original.price;
                const advance = row.original.advance;

                if (price === null && advance === null) {
                    return <div className="text-3xl">-</div>;
                }


                if (advance === null) {
                    return <>{price}</>;
                }
                if (price === null) {
                    return <div className="text-3xl">-</div>;
                }

                const remaining = parseFloat(price) - parseFloat(advance);
                return <>{remaining}</>;
            }
        }       , {
            Header: "Note",
            accessor: "note",
            Cell: ({value}) => {
                const [showNote, setShowNote] = useState(false);

                return (
                    <div>

                        <div className="flex items-center gap-2">
                        <span
                            className={`max-w-[300px] break-words h-auto text-wrap text-justify ${
                                showNote ? (value && "w-[180px]") : " line-clamp-1"
                            }`}
                        >
                            {showNote && value }
                        </span>
                            <button
                                type="button"
                                disabled={!value}
                                onClick={() => setShowNote(!showNote)}
                                className={`hover:text-white border  font-medium rounded-lg text-sm p-1 ml-2 text-center me-2 
                            ${
                                    !value
                                        ? "border-green-500 text-green-500 hover:bg-green-600"
                                        : "border-red-500 text-red-500 hover:bg-red-600"
                                }`}
                            >
                                {showNote ? <FaEyeSlash/> : <FaEye/>}
                            </button>
                        </div>

                    </div>
                );
            },
        },
        {
            Header: "Nombre de Commandes", accessor: "orderCount", Cell: ({value}) => {
                return <div className="flex justify-center">{value > 0 ? <span
                        className="bg-green-100 text-green-800 font-medium me-2 px-2.5 py-0.5 rounded pr-5 pl-5">{value}</span>
                    : <span
                        className="bg-red-100 text-red-800  font-medium me-2 px-2.5 py-0.5 rounded pr-5 pl-5">{value}</span>
                }</div>

            }
        }, {
            Header: "Action", accessor: "action", Cell: ({row}) => {
                return (
                    <div className="flex gap-1">
                        <button type="button"
                                className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2 mb-2 "
                                onClick={() => handleStartAdding(row.original.id)}><ImBin/>
                        </button>
                        <a href={`/jewelry/order/suppliers/${row.original.id}`}
                           className=" text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4
                        focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                        ><ImEye/>
                        </a>
                    </div>
                );
            },
        },
    ], []);

    function handleStartAdding(id) {
        setSelectedSupplierId(id);
        setModalIsOpen(true);
    }

    function handleStopAdding() {
        setPassword(null);
        setModalIsOpen(false);
    }

    async function handleDelete(id) {
        setLoading(true);
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
                setLoading(false);
                throw new Error('Mot de passe incorrect');
            }

            setIsUpdating(true);
            const response = await fetch(`/api/suppliers/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const updatedSuppliers = suppliers.filter(order => order.id !== id);
                setSuppliers(updatedSuppliers);
                handleStopAdding();
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
                setLoading(false);
                console.error('Failed to delete supplier');
            }
        } catch (error) {
            setLoading(false);
            console.error('Error deleting supplier:', error);
            setConfirmError(error.message);
        } finally {
            setIsUpdating(false); // End loading
        }
    }


    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/suppliers/list?userId=${session.user.id}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    if (!Array.isArray(data)) {
                        throw new Error('Data is not an array');
                    }
                    setSuppliers(data);
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

    if (isLoading) {
        return <LoadingPage/>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <Header title="Liste des commandes "/>
            {isUpdating && <LoadingPage/>}
            <FilterableTable columns={columns} data={suppliers}/>

            <Modal open={modalIsOpen} onClose={handleStopAdding}>

                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={handleStopAdding}
                            className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900
                         rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                            data-modal-hide="popup-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500"> Es-tu sûr ?</h1>
                        <h3 className="mb-5 text-xl font-normal text-gray-500 ">Voulez-vous vraiment supprimer ce
                            Fournisseur ?</h3>
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
                                onClick={() => handleDelete(selectedSupplierId)} disabled={loading}
                                className="text-white focus:ring-4 bg-blue-500 disabled:bg-blue-300 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleStopAdding}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >No, Annuler
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default Page;
