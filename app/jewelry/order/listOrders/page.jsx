"use client"
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Header from "@/components/bids/header/header";
import {useSession} from "next-auth/react";
import {ImBin, ImEye, ImPrinter} from "react-icons/im";
import LoadingPage from "@/components/UI/LoadingPage";
import Modal from "@/components/bids/UI/Modal";
import FilterableTable from "@/components/jewelry/orders/table/FilterableTable";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import StateCheck from "@/components/jewelry/orders/StateCheck";
import ImageOrderModal from "@/components/jewelry/orders/ImageOrderModal";
import Image from "next/image";
import {BsPlus} from "react-icons/bs";
import {AiOutlineMinus} from "react-icons/ai";
import PdfGenerator from "@/components/jewelry/guarantee/PdfGenerator";

function Page() {
    const {data: session} = useSession();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false); // New state for tracking updates
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [modalUpdateIsOpen, setModalUpdateIsOpen] = useState(false);
    const [modalImageIsOpen, setModalImageIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [updatedPrice, setUpdatedPrice] = useState('');
    const [updatedAdvance, setUpdatedAdvance] = useState('');
    const [updatedNote, setUpdatedNote] = useState('');
    const [advance, setAdvance] = useState(null);
    const[loading, setLoading] = useState(false);
    const [editedImage, setEditedImage] = useState(null);
    const [modalAddIsOpen, setModalAddIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        phone: "",
        rows: {}
        ,
    });
    const [updatedClientCode, setUpdatedClientCode] = useState(null);
    const [showPdfGenerator, setShowPdfGenerator] = useState(false);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} à ${hours}:${minutes}`;
    };

    useEffect(() => {
        if (selectedOrderId) {
            const selected = orders.find(s => s.id === selectedOrderId);
            setUpdatedAdvance(selected?.advance);
            setUpdatedPrice(selected?.price);
            setUpdatedNote(selected?.note || '');
        }
    }, [selectedOrderId, orders]);

    async function updateFormData(guaranteeId, rowData, orderHistory) {
        setFormData({
            code: rowData.original.formattedOrderId,
            name: rowData.original.name,
            phone: rowData.original.phone,
            rows: orderHistory,
        });

    }

    const fetchOrderHistory = async (orderId, rowData,client) => {

        let data = null; // Declare data outside the try block
        try {
            const response = await fetch(`/api/orders/orderHistoryById?orderId=${orderId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            data = await response.json(); // Assign response data to data variable
        } catch (error) {

        } finally {
            if (data) {
                updateFormData(orderId, rowData, data);
                setUpdatedClientCode(client);
                await setShowPdfGenerator(true);
            }
        }
    };

    const handlePrint = (id, rowData,client) => {


        fetchOrderHistory(id, rowData,client);
    };


    const columns = useMemo(() => [
        {Header: "Code Client", accessor: "clientCode"},
        
        {Header: "Code", accessor: "formattedOrderId"},
        {
            Header: "Nom et Prénom", accessor: "name", Cell: ({value}) => {
                return value ? <>{value}</> : <div className="text-3xl">-</div>
            }
        },
        {Header: "Prix", accessor: "price",
            Cell: ({ value }) => (value ? value : <>0</>),
        },
        {Header: "Avance", accessor: "advance",
            Cell: ({ value }) => (value ? value : <>0</>),
        },{
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
   ,
        {Header: "Modèle", accessor: "model",
            Cell: ({ value }) => (value ? value : <div className="text-3xl">-</div>),
        },
        {
            Header: "Pr", accessor: "origin",
            Cell: ({ value }) => (value ? value : <div className="text-3xl">-</div>),
        },
        {
            Header: "Carat", accessor: "carat",
            Cell: ({ value }) => (value ? value : <div className="text-3xl">-</div>),
        },
        {
            Header: "Poids", accessor: "weight", Cell: ({value}) => (<>{value}g</>)
        },
        ,
        {
            Header: "Mois", accessor: "months",   Cell: ({ value }) => (value ? value : <>1</>),
        },
        {
            Header: "Date", accessor: "updatedAt", Cell: ({value}) => (<>{formatDate(value)}</>)
        }     , {
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
                                className={`hover:text-white border  font-medium rounded-lg text-sm p-1  text-center  
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
        }, {
            Header: "État ", accessor: "status", Cell: ({value, row}) => {
                return (<StateCheck id={row.original.id} value={value} setOrders={setOrders}/>

                );
            },
        },{
            Header: "Ajouter un montant",
            accessor: "amountadd",
            Cell: ({row}) => {


                const inputRef = useRef(null);

                const handleAmountChange = (id, operation) => {
                    const inputValue = inputRef.current.value.trim();

                    if (inputValue && !isNaN(inputValue)) {
                        const amount = parseFloat(inputValue); // Convert input to a number

                        const newAmount = operation === "plus" ? amount : -amount; // Determine positive or negative
                        // Convert the new amount to a string
                        const newAmountString = newAmount.toString();

                        setSelectedOrderId(id);
                        setAdvance(newAmount);
                        setModalAddIsOpen(true);

                        inputRef.current.value = "";
                    }
                };

                return (
                    <div className="flex gap-1 items-center">
                        <input
                            ref={inputRef}
                            type="number"
                            placeholder="Saisir un montant"
                            className="w-full rounded-md max-w-52 border border-[#e0e0e0] bg-white px-6 py-2 text-base font-medium text-[#6B7280] focus:outline-blue-500 focus:shadow-md"
                            onInput={(e) => {
                                // Prevent negative numbers
                                if (e.target.value < 0) {
                                    e.target.value = "";
                                }
                            }}
                        />

                        {/* Plus Button */}
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

            },
        }, {
            Header: "Image", accessor: "image",
            Cell: ({ row }) => {
                const imageExists = row.original.image ;

                return (
                    <div className="flex gap-1">
                        {imageExists ? (
                            <button
                                type="button"
                                className="text-gray-700 hover:text-white border border-gray-700 hover:bg-gray-800 focus:ring-4
                        focus:outline-none focus:ring-gray-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2"
                                onClick={() => {
                                    setModalImageIsOpen(true);
                                    setImageUrl(row.original.image);
                                }}>

                                    <ImEye/>
                            </button>
                            ) : (
                            <div className="text-3xl">-</div>
                        )}
                    </div>
                );
            },
        }, {
            Header: "Action", accessor: "action", Cell: ({row}) => {
                return (
                    <div className="flex gap-1">
                        <button type="button"
                                className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800  font-medium rounded-lg
                        text-sm px-5 py-2 text-center me-2  "
                                onClick={() => handleStartAdding(row.original.id)}><ImBin/>
                        </button>
                        <button type="button" onClick={() => handlePrint(row.original.id, row,row.original.clientCode)}
                                className=" text-yellow-600 hover:text-white border border-yellow-600 hover:bg-yellow-600  ffont-medium rounded-lg
                        text-sm px-5 py-2 text-center me-2 "
                        ><ImPrinter/>
                        </button>
                        <button type="button"
                                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800  font-medium rounded-lg
                        text-sm px-5 py-2 text-center me-2  "
                                onClick={() => handleStartUpdate(row.original.id)}>Modifier
                        </button>

                    </div>
                );
            },
        },
    ], [setOrders]);

    const handleStartUpdate = (id) => {
        setSelectedOrderId(id);

        setModalUpdateIsOpen(true);
    };

    function handleStartAdding(id) {
        setSelectedOrderId(id);
        setModalIsOpen(true);
    }

    function handleStopAdding() {
        setModalIsOpen(false);
    }

    function handleStopUpdate() {
        setModalUpdateIsOpen(false);
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

            setIsUpdating(true); // Start loading
            setLoading(true);
            const response = await fetch(`/api/orders/delete?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const updatedOrders = orders.filter(order => order.id !== id);
                setOrders(updatedOrders);
                handleStopAdding();

                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
                setLoading(false);
                console.error('Failed to delete order');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            setConfirmError(error.message);
        } finally {
            setIsUpdating(false); // End loading
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/orders/gets?userId=${session.user.id}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    if (!Array.isArray(data)) {
                        throw new Error('Data is not an array');
                    }
                    setOrders(data);
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

    async function handleUpdate(id) {
        try {
            setLoading(true);

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
            const response = await fetch(`/api/orders/update?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, price: updatedPrice,note : updatedNote,advance : updatedAdvance, image : editedImage}),
            });
            if (response.ok) {
                handleStopAdding();
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
                window.location.reload();
                setPassword(null);
                setLoading(false);
                setModalIsOpen(false);
            }
        } catch (error) {
            console.error('Error updating amount:', error);
            setLoading(false);

            setConfirmError(error.message);
        }
    }

    const handleCloseModal = () => {
        setModalImageIsOpen(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataURL = reader.result;
                const newImage = {
                    size: file.size,
                    type: file.type,
                    name: file.name,
                    lastModified: file.lastModified,
                    dataURL: dataURL
                };
                setEditedImage(newImage);

            };
            reader.readAsDataURL(file);

        }
    };

    function handleStopAddingOrder() {
        setModalAddIsOpen(false);
        setPassword(null);
    }

    async function handleAddAmount(id) {
        try {
            setLoading(true);
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

            const response = await fetch(`/api/orders/updateAmount?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, amount: advance}),
            });
            if (response.ok) {
                handleStopAdding();
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
                window.location.reload();
                setPassword(null);
                setModalIsOpen(false);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error updating amount:', error);
            setConfirmError(error.message);
        }
    }

    function handleClosePdf() {
        setShowPdfGenerator(false);

    }

    return (
        <>

            {!showPdfGenerator && <>
                <Header title="Liste des commandes "/>
                {isUpdating && <LoadingPage/>}
                <FilterableTable columns={columns} data={orders}/>
            </>}
            {showPdfGenerator && <div className="flex flex-col p-4 ">
                <PdfGenerator formData={formData} handleClosePdf={handleClosePdf} updatedClientCode={updatedClientCode}/>
            </div>}
            <ImageOrderModal open={modalImageIsOpen} onClose={handleCloseModal} url={imageUrl}/>

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
                        <h3 className="mb-5 text-xl font-normal text-gray-500 ">Voulez-vous vraiment supprimer cette
                            commandes ?</h3>
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
                                onClick={() => handleDelete(selectedOrderId)} disabled={loading}
                                className="text-white focus:ring-4 bg-blue-500 disabled:bg-gray-300 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
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

            <Modal open={modalUpdateIsOpen} onClose={handleStopUpdate}>

                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={handleStopUpdate}
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
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment modifier la Commande?</h3>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="advance"
                                   className="text-lg font-normal text-gray-500 pr-2 w-24">Prix</label>
                            <input
                                type="number"
                                id="advance"
                                value={updatedPrice || ""}
                                placeholder="prix  ..."
                                onChange={(e) => setUpdatedPrice(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="advance"
                                   className="text-lg font-normal text-gray-500 pr-2 w-24">Avance</label>
                            <input
                                type="number"
                                id="advance"
                                value={updatedAdvance || ""}
                                placeholder="avance  ..."
                                onChange={(e) => setUpdatedAdvance(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="note"
                                   className="text-lg font-normal text-gray-500 pr-2 w-24">Note</label>
                            <textarea
                                id="note"
                                rows="5"
                                value={updatedNote || ""}
                                placeholder="note ..."
                                onChange={(e) => setUpdatedNote(e.target.value)}
                                className="block p-2.5 w-full    outline-none  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500  resize-none"

                            />
                        </div>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="image" className="text-lg font-normal text-gray-500 pr-2 w-24">Image
                                :</label>
                            <input

                                type="file" name="image" id="image" accept="image/png, image/jpeg"
                                onChange={handleImageChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"  />

                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 min-w-20 rounded w-full  outline-none focus-within:border-blue-700  focus:ring-blue-500 "
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
                                onClick={() => handleUpdate(selectedOrderId)} disabled={loading}
                                className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleStopUpdate}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >No,
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={modalAddIsOpen} onClose={handleStopAddingOrder}>

                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={handleStopAddingOrder}
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
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment ajouter ce
                            montant?</h3>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 min-w-20 rounded w-full  outline-none focus-within:border-blue-700  focus:ring-blue-500 "
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
                        <button data-modal-hide="popup-modal" type="submit" disabled={loading}
                                onClick={() => handleAddAmount(selectedOrderId)}
                                className="text-white focus:ring-4 bg-blue-500 disabled:bg-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleStopAddingOrder}
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
