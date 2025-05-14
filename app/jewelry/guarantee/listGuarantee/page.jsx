"use client"
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSession} from "next-auth/react";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import {ImBin, ImEye, ImPrinter} from "react-icons/im";
import LoadingPage from "@/components/UI/LoadingPage";
import Header from "@/components/bids/header/header";
import Modal from "@/components/bids/UI/Modal";
import FilterableTable from "@/components/jewelry/guarantee/FilterableTable";
import {AiOutlineMinus} from "react-icons/ai";
import {BsPlus} from "react-icons/bs";
import ModalGuaranteeUpdate from "@/components/jewelry/guarantee/ModalGuaranteeUpdate";
import PdfGenerator from "@/components/jewelry/guarantee/PdfGenerator";
import ListSavings from "@/components/jewelry/saving/ListSavings";

function Page() {
    const {data: session} = useSession();
    const [guarantee, setGuarantee] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGuaranteeId, setSelectedGuaranteeId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [paymentModalIsOpen, setPaymentModalIsOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentOperation, setPaymentOperation] = useState('');
    const [paymentPassword, setPaymentPassword] = useState('');
    const [paymentConfirmError, setPaymentConfirmError] = useState('');
    const [modalUpdateIsOpen, setModalUpdateIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        phone: "",
        rows: {}
        ,
    });
    const [showPdfGenerator, setShowPdfGenerator] = useState(false);
    const [updatedClientCode, setUpdatedClientCode] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/guarantee/gets?userId=${session.user.id}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    if (!Array.isArray(data)) {
                        throw new Error('Data is not an array');
                    }
                    setGuarantee(data);
                } catch (error) {
                    console.error('Error fetching products:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [session]);


    const handleStartUpdate = (id) => {
        setSelectedGuaranteeId(id);
        setModalUpdateIsOpen(true);
    };
    const fetchGuaranteeHistory = async (guaranteeId, rowData,client) => {

        let data = null; // Declare data outside the try block
        try {
            const response = await fetch(`/api/guarantee/guaranteeHistoryById?guaranteeId=${guaranteeId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            data = await response.json(); // Assign response data to data variable
        } catch (error) {

        } finally {
            if (data) {
                updateFormData(guaranteeId, rowData, data);
                setUpdatedClientCode(client);
                await setShowPdfGenerator(true);
            }
        }
    };

    const handlePrint = (id, rowData,client) => {


        fetchGuaranteeHistory(id, rowData,client);
    };


    const columns = useMemo(() => [
        {Header: "Code Client", accessor: "clientCode", Cell: ({value}) => {
                return value ? <>{value}</> : <div className="text-3xl">-</div>
            }},
        {Header: "Code Guarantee", accessor: "formattedGuaranteeId"},    {
            Header: "Code Produit",
            accessor: "rows",
            Cell: ({ value }) => {

                if (!value || value.length === 0) {
                    return <div className="text-3xl">-</div>;
                }
                return value.map((product) => product.code).join(", ");
            }
        }/*,{
            Header: "Statut ",
            accessor: "firstProductStatus",
            Cell: ({ row }) => {
                const products = row.original.rows;
                if (!products || products.length === 0) {
                    return <div className="text-3xl">-</div>;
                }
                const firstStatus = products[0].status;

                // Status translations and styling
                const statusConfig = {
                    deleted: {
                        label: "Supprimé",
                        style: "bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400"
                    },
                    Sold: {
                        label: "Vendu",
                        style: "bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded border border-indigo-400"
                    },
                    Facilité: {
                        label: "Facilité",
                        style: "bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400"
                    },
                    Crédit: {
                        label: "Crédit",
                        style: "bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-400"
                    },
                    default: {
                        label: firstStatus, // Keep original if not in our list
                        style: "bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-400"
                    }
                };

                const config = statusConfig[firstStatus] || statusConfig.default;

                return (
                    <span className={config.style}>
                {config.label}
            </span>
                );
            }
        }*/,
        {
            Header: "Date de création", accessor: "createdAt", Cell: ({value}) => {
                const date = new Date(value);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return <>{day}-{month}-{year}</>;
            }
        },{
            Header: "Date Modification", accessor: "updatedAt", Cell: ({value}) => {
                const date = new Date(value);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return <>{day}-{month}-{year}</>;
            }
        },
        {
            Header: "Nom", accessor: "name", Cell: ({value}) => {
                return value ? <>{value}</> : <div className="text-3xl">-</div>
            }
        },
        {
            Header: "Contact", accessor: "phone", Cell: ({value}) => {
                return value ? <>{value}</> : <div className="text-3xl">-</div>
            }
        },
        {Header: "Prix", accessor: "price",
            Cell: ({ value }) => (value ? value : <>0</>),
        },
        {Header: "Avance", accessor: "advance",
            Cell: ({ value }) => (value ? value : <>0</>),
        },,{
            Header: "Restant",
            accessor: "remaining",
            Cell: ({ row }) => {
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
        }
        , {
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
        },       {Header: "Mois", accessor: "months",
            Cell: ({ value }) => (value ? value : <>0</>),
        },{
            Header: "Facilité",
            accessor: "tableData",
            Cell: ({ value }) => {
                const [showFacilitated, setShowFacilitated] = useState(false);

                if (!value || value.length === 0) {
                    return <div className="text-3xl">-</div>;
                }

                return (
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => setShowFacilitated(!showFacilitated)}
                            className="text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-600 focus:ring-4
               focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-1 flex items-center justify-center"
                        >
                            {showFacilitated ? <FaEyeSlash/> : <FaEye/>}
                        </button>
                        {showFacilitated && (
                            <ul className="list-disc  text-justify">
                                {value.map((item, index) => (
                                    <li key={index} className="mb-1">
                                        <div><strong>Date:</strong> {formatDate(item.date)}</div>
                                        <div>
                                            <strong>État:</strong> {item.checkNumber.toLowerCase() === "paid" ? "Payé" : "En attente"}
                                        </div>
                                        <div><strong>Montant:</strong> {parseFloat(item.amount).toFixed(2)}</div>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </div>
                );
            },
        },
        {
            Header: "Ajouter un montant",
            accessor: "amountadd",
            Cell: ({ row }) => {
                const inputRef = useRef(null);

                const handleAmountChange = (id, operation) => {
                    const inputValue = inputRef.current.value.trim();

                    if (!inputValue || isNaN(inputValue)) return;

                    setSelectedPaymentId(id);
                    setPaymentAmount(inputValue);
                    setPaymentOperation(operation);
                    setPaymentModalIsOpen(true);
                };

                // Check if the selected component is "cash"
                if (row.original.selectedComponent === "Facilitated") {
                    return (
                        <div className="flex gap-1 items-center">
                            <input
                                ref={inputRef}
                                type="number"
                                placeholder="Saisir un montant"
                                className="w-full rounded-md min-w-52 border border-gray-300 bg-white px-6 py-2 text-base text-gray-700 focus:outline-blue-500"
                            />

                            {/* Recevoir Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    handleAmountChange(row.original.id, "plus");
                                }}
                                className="text-white bg-green-500 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-base px-3 py-2 focus:outline-none"
                            >
                                <BsPlus /> {/* Replace with a plus icon */}
                            </button>

                            {/* Minus Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    handleAmountChange(row.original.id, "minus");
                                }}
                                className="text-white bg-red-500 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base px-3 py-2 focus:outline-none"
                            >
                                <AiOutlineMinus />
                            </button>
                        </div>
                    );
                } else {
                    // Return a placeholder or nothing if the selected component is not "cash"
                    return <div className="text-3xl">-</div>;
                }
            },
        }
,
        {
            Header: "Action", accessor: "action", Cell: ({row}) => {
                return (
                    <div className="flex gap-1">
                        <button type="button"
                                className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2 mb-2 "
                                onClick={() => handleStartDeleting(row.original.id)}><ImBin/>
                        </button>
                        <button type="button" onClick={() => handlePrint(row.original.id, row,row.original.clientCode)}
                                className=" text-yellow-600 hover:text-white border border-yellow-600 hover:bg-yellow-600 focus:ring-4
                        focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2  "
                        ><ImPrinter/>
                        </button>
                        <button type="button"
                                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800
                        focus:outline-none font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2 mb-2 "
                                onClick={() => handleStartUpdate(row.original.id)}>Modifier
                        </button>
                    </div>
                );
            },
        },
    ], []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };
    function handleStartDeleting(id) {
        setSelectedGuaranteeId(id);
        setModalIsOpen(true);
    }

    function handleStopDeleting() {
        setPassword(null);
        setModalIsOpen(false);
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

            setIsUpdating(true);

            const response = await fetch('/api/guarantee/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id }),
            });

            if (response.ok) {
                const updatedGuarantees = guarantee.filter(order => order.id !== id);
                setGuarantee(updatedGuarantees);
                handleStopDeleting();
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
                console.error('Failed to delete Guarantee');
            }
        } catch (error) {
            console.error('Error deleting Guarantee:', error);
            setConfirmError(error.message);
        } finally {
            setIsUpdating(false);
        }
    }

    if (isLoading) {
        return <LoadingPage/>;
    }
    const handlePayment = async (id, amount, operation) => {
        try {
            const passwordCheckResponse = await fetch('/api/auth/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    password: paymentPassword,
                }),
            });

            const passwordCheckResult = await passwordCheckResponse.json();

            if (!passwordCheckResponse.ok || !passwordCheckResult.success) {
                throw new Error('Mot de passe incorrect');
            }

            setIsUpdating(true);

            const response = await fetch("/api/guarantee/payment", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    amountChange: amount,
                    operation,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la mise à jour du paiement");
            }

            // Fetch the updated guarantee data from the server
            const updatedResponse = await fetch(`/api/guarantee/gets?userId=${session.user.id}`);
            if (!updatedResponse.ok) {
                throw new Error('Erreur lors de la récupération des données mises à jour');
            }

            const updatedData = await updatedResponse.json();
            if (!Array.isArray(updatedData)) {
                throw new Error('Les données mises à jour ne sont pas valides');
            }

            // Update the local state with the new data
            setGuarantee(updatedData);
window.location.reload();
            // Close the payment modal
            setPaymentPassword(null);

            setPaymentModalIsOpen(false);
        } catch (error) {
            console.error("Error updating amount:", error);
            setPaymentConfirmError(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    function handleStopUpdate() {
        setModalUpdateIsOpen(false);
    }



    async function updateFormData(guaranteeId, rowData, savingHistory) {
        setFormData({
            code: rowData.original.formattedGuaranteeId,
            name: rowData.original.name,
            phone: rowData.original.phone,
            rows: savingHistory,
        });

    }

    function handleClosePdf() {
        setShowPdfGenerator(false);

    }
    return (
        <>

            {!showPdfGenerator && <>
                <Header title="Liste des Facilité"/>
                <FilterableTable columns={columns} data={guarantee}/>
            </>}
            {showPdfGenerator && <div className="flex flex-col p-4 ">
                <PdfGenerator formData={formData} handleClosePdf={handleClosePdf} updatedClientCode={updatedClientCode}/>
            </div>}
            <Modal open={modalIsOpen} onClose={handleStopDeleting}>

                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={handleStopDeleting}
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
                            Garantie ?</h3>
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
                                onClick={() => handleDelete(selectedGuaranteeId)}
                                className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleStopDeleting}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >No, Annuler
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={paymentModalIsOpen} onClose={() => setPaymentModalIsOpen(false)}>
                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={() => setPaymentModalIsOpen(false)}
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
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500">Confirmer le paiement</h1>
                        <h3 className="mb-5 text-xl font-normal text-gray-500 ">Voulez-vous vraiment effectuer cette opération ?</h3>
                        <input
                            type="password"
                            placeholder="Password"
                            value={paymentPassword}
                            onChange={(e) => setPaymentPassword(e.target.value)}
                            className="mb-4 p-2 border-2 rounded w-full  outline-none focus-within:border-blue-700  focus:ring-blue-500 "
                        />
                        {paymentConfirmError && (
                            <div className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 mb-2 p-1 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                     fill="none"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p className="text-center">{paymentConfirmError}</p>
                            </div>
                        )}
                        <button data-modal-hide="popup-modal" type="submit"
                                onClick={() => handlePayment(selectedPaymentId, paymentAmount, paymentOperation)}
                                className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, confirmer
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={() => setPaymentModalIsOpen(false)}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >Non, annuler
                        </button>
                    </div>
                </div>
            </Modal>
            <ModalGuaranteeUpdate guarantees={guarantee} selectedGuaranteeId={selectedGuaranteeId} modalUpdateIsOpen={modalUpdateIsOpen} handleStopUpdate={handleStopUpdate}/>

        </>
    );
}

export default Page;