"use client"
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Header from "@/components/bids/header/header";
import ListSavings from "@/components/jewelry/saving/ListSavings";
import {useSession} from "next-auth/react";
import {ImBin, ImPlus, ImPrinter} from "react-icons/im";
import LoadingPage from "@/components/UI/LoadingPage";
import Modal from "@/components/bids/UI/Modal";
import PdfGenerator from "@/components/jewelry/saving/PdfGenerator";
import {BsPlus} from "react-icons/bs";
import {AiOutlineMinus} from "react-icons/ai";
import {FaEye, FaEyeSlash} from "react-icons/fa";

function Page() {
    const {data: session} = useSession();
    const [savings, setSavings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSavingId, setSelectedSavingId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalAddIsOpen, setModalAddIsOpen] = useState(false);
    const [amounts, setAmounts] = useState({});
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [showPdfGenerator, setShowPdfGenerator] = useState(false);
    const [modalUpdateIsOpen, setModalUpdateIsOpen] = useState(false);
    const [updatedPrice, setUpdatedPrice] = useState('');
    const [updatedLocation, setUpdatedLocation] = useState('');
    const [updatedPhone, setUpdatedPhone] = useState('');
    const [updatedName, setUpdatedName] = useState('');
    const [updatedNote, setUpdatedNote] = useState('');
    const [updatedClientCode, setUpdatedClientCode] = useState(null);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        phone: "",
        rows: {}
        ,
    });
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/savings/gets?userId=${session.user.id}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    if (!Array.isArray(data)) {
                        throw new Error('Data is not an array');
                    }
                    setSavings(data);
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

    useEffect(() => {
        if (selectedSavingId) {
            const selected = savings.find(s => s.id === selectedSavingId);
            setUpdatedName(selected?.name);
            setUpdatedNote(selected?.note);

            setUpdatedPrice(selected?.amount);
            setUpdatedPhone(selected?.phone);
            setUpdatedLocation(selected?.location);
        }
    }, [selectedSavingId, savings]);

    const fetchSavingHistory = async (savingId, rowData,client) => {
        setError(null);
        let data = null; // Declare data outside the try block
        try {
            const response = await fetch(`/api/savings/savingHistoryById?savingId=${savingId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            data = await response.json(); // Assign response data to data variable
        } catch (error) {
            setError(error.message);
        } finally {
            if (data) {
                updateFormData(savingId, rowData, data);
                setUpdatedClientCode(client);

                await setShowPdfGenerator(true);
            }
        }
    };


    function handleClosePdf() {
        setShowPdfGenerator(false);

    }

    async function updateFormData(savingId, rowData, savingHistory) {
        setFormData({
            code: rowData.original.UserSavingSequence,
            name: rowData.original.name,
            phone: rowData.original.phone,
            rows: savingHistory,
        });

    }

    const handlePrint = (id, rowData,client) => {


        fetchSavingHistory(id, rowData,client);
    };

    const handleStartUpdate = (id) => {
        setSelectedSavingId(id);
        setModalUpdateIsOpen(true);
    };
    const columns = useMemo(() => [
        {Header: "Code Client", accessor: "clientCode"},
        {Header: "Code", accessor: "UserSavingSequence"}, {
        Header: "Nom et Prénom",
        accessor: "name"
    }, {
        Header: "Localisation",
        accessor: "location",
        Cell: ({ value }) => (value ? value : "-"),
    },
        {
            Header: "Téléphone",
            accessor: "phone",
            Cell: ({ value }) => (value ? value : "-"),
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
        }
        , {Header: "Montant total", accessor: "amount", Cell: ({value}) => (<>{value} Dt</>)}, {
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

                    setSelectedSavingId(id);
                    setAmounts((prevAmounts) => ({
                        ...prevAmounts,
                        [id]: newAmount,
                    }));
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
                        className="w-full rounded-md min-w-52 border border-[#e0e0e0] bg-white px-6 py-2 text-base font-medium text-[#6B7280] focus:outline-blue-500 focus:shadow-md"
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
    },
        {
            Header: "Action", accessor: "action", Cell: ({row}) => {
                return (<div className="flex gap-1">
                    <button type="button"
                            className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2 mb-2 "
                            onClick={() => handleStartAdding(row.original.id)}><ImBin/>
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
                </div>);
            },
        },], [amounts]);


    function handleStartAddingAmount(id, amount) {
        setSelectedSavingId(id);

        setModalAddIsOpen(true);
    }

    function handleStartAdding(id) {
        setSelectedSavingId(id);
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

            const response = await fetch(`/api/savings/delete?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const updatedSavings = savings.filter(saving => saving.id !== id);
                setSavings(updatedSavings);
                handleStopAdding();
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
            }
        } catch (error) {
            console.error('Error deleting auction:', error);
            setConfirmError(error.message);

        }
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

            const response = await fetch(`/api/savings/updateAmount?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, amount: amounts[id]}),
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


    function handleStopAdding() {
        setModalIsOpen(false);
        setPassword(null);
    }

    function handleStopAddingSaving() {
        setModalAddIsOpen(false);
        setPassword(null);
    }


    if (isLoading) {
        return <LoadingPage/>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }



    function handleStopUpdate() {
        setModalUpdateIsOpen(false);
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
            const response = await fetch(`/api/savings/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, amount: updatedPrice,location : updatedLocation,name : updatedName,note:updatedNote, phone : updatedPhone,userId: session.user.id}),
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


    return (<>
        <Header title="Liste des Épargne "/>
        {!showPdfGenerator && <div className="flex flex-col p-4 ">
            <ListSavings columns={columns} data={savings}/>
        </div>}
        {showPdfGenerator && <div className="flex flex-col p-4 ">
            <PdfGenerator formData={formData} handleClosePdf={handleClosePdf} updatedClientCode={updatedClientCode}/>
        </div>}

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
                        Épargne ?</h3>
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
                            onClick={() => handleDelete(selectedSavingId)}
                            className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
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

        <Modal open={modalAddIsOpen} onClose={handleStopAddingSaving}>

            <div className="relative bg-white rounded-lg shadow ">
                <button type="button" onClick={handleStopAddingSaving}
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
                            onClick={() => handleAddAmount(selectedSavingId)}
                            className="text-white focus:ring-4 bg-blue-500 disabled:bg-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                    >
                        Oui, je suis sûr
                    </button>
                    <button data-modal-hide="popup-modal" type="button" onClick={handleStopAddingSaving}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                    >No,
                        Annuler
                    </button>
                </div>
            </div>
        </Modal>

        <Modal open={modalUpdateIsOpen} onClose={handleStopUpdate}>
            <div className="relative bg-white rounded-lg shadow">
                <button
                    type="button"
                    onClick={handleStopUpdate}
                    className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                    data-modal-hide="popup-modal"
                >
                    <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
                <div className="p-4 md:p-5 text-center">
                    <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>
                    <h3 className="mb-5 text-lg font-normal text-gray-500">
                        Voulez-vous vraiment modifier la Ma7lol?
                    </h3>

                    {/* Form Fields */}
                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="advance" className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                            Montant:
                        </label>
                        <input
                            type="number"
                            id="advance"
                            value={updatedPrice || ""}
                            placeholder="Montant ..."
                            onChange={(e) => setUpdatedPrice(e.target.value)}
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                        />
                    </div>

                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="name" className="text-lg font-normal text-start mr-3 text-gray-500 pr-2 w-24">
                            Nom:
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={updatedName || ""}
                            placeholder="Nom et prénom ..."
                            onChange={(e) => setUpdatedName(e.target.value)}
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                        />
                    </div>

                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="phone" className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                            Téléphone:
                        </label>
                        <input
                            type="text"
                            id="phone"
                            value={updatedPhone || ""}
                            placeholder="Numéro de téléphone ..."
                            onChange={(e) => setUpdatedPhone(e.target.value)}
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                        />
                    </div>

                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="location" className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                            Emplacement:
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={updatedLocation || ""}
                            placeholder="Emplacement ..."
                            onChange={(e) => setUpdatedLocation(e.target.value)}
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
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
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-4 p-2 border-2 min-w-20 rounded w-full outline-none focus-within:border-blue-700 focus:ring-blue-500"
                    />

                    {confirmError && (
                        <div className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 mb-2 p-1 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-center">{confirmError}</p>
                        </div>
                    )}

                    <button
                        data-modal-hide="popup-modal"
                        type="submit"
                        onClick={() => handleUpdate(selectedSavingId)}
                        disabled={loading}
                        className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                    >
                        Oui, je suis sûr
                    </button>
                    <button
                        data-modal-hide="popup-modal"
                        type="button"
                        onClick={handleStopUpdate}
                        className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                    >
                        No, Annuler
                    </button>
                </div>
            </div>
        </Modal>
    </>);
}

export default Page;