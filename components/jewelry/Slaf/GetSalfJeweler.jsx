import React, {useEffect, useMemo, useRef, useState} from 'react';
import LoadingPage from "@/components/UI/LoadingPage";
import {ImBin} from "react-icons/im";
import { BsPlus } from "react-icons/bs";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import ListSlaf from "@/components/jewelry/Slaf/listSlaf";
import Modal from "@/components/bids/UI/Modal";
import {AiOutlineMinus} from "react-icons/ai";

function GetSalfJeweler({jewelerId, userId}) {
    const [slaf, setSlaf] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSlafId, setSelectedSlafId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalAddIsOpen, setModalAddIsOpen] = useState(false);
    const [modalUpdateIsOpen, setModalUpdateIsOpen] = useState(false);
    const [amounts, setAmounts] = useState({});
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [unit, setUnit] = useState(null);
    const [note, setNote] = useState("");
    const [selectedSlaf, setSelectedSlaf] = useState(null);
    const [updatedAmount, setUpdatedAmount] = useState('');
    const [updatedNote, setUpdatedNote] = useState('');
    const [buttonActive,setButtonActive] = useState(true);
    const handleNoteChange = (event) => {
        setNote(event.target.value);
    };


    useEffect(() => {
        const fetchData = async () => {
            if (userId) {
                try {
                    const response = await fetch(`/api/Slaf/getByUserAndJeweler?userId=${userId}&jewelerId=${jewelerId}`);
                    const response2 = await fetch(`/api/Slaf/getHistoryByJeweler?userId=${userId}&jewelerId=${jewelerId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    if (!response2.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    const data2 = await response2.json();

                    console.log('Fetched history data:', data2.history);  // Debugging line

                    setSlaf(data.slafs);
                    setHistory(data2);
                } catch (error) {
                    console.error('Error fetching products:', error);
                    setError(error.message);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [jewelerId, userId]);






    const columns = useMemo(() => [
        {Header: "Date", accessor: "createdAt", Cell: ({value}) => (<>{formatDate(value)}</>)
        }, {Header: "Code", accessor: "code"},
         {Header: "Montant", accessor: "amount"}, {
            Header: "Devise",
            accessor: "unit",
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
        },
        {
            Header: "Ajouter un montant",
            accessor: "amountadd",
            Cell: ({ row }) => {
                const inputRef = useRef(null);

                const handleAmountChange = (id, operation) => {
                    const inputValue = inputRef.current.value.trim();

                    if (inputValue && !isNaN(inputValue)) {
                        const amount = parseFloat(inputValue); // Convert input to a number

                        const newAmount = operation === "plus" ? amount : -amount; // Determine positive or negative

                        // Convert the new amount to a string
                        const newAmountString = newAmount.toString();

                        setSelectedSlafId(id);
                        setAmounts((prevAmounts) => ({
                            ...prevAmounts,
                            [id]: newAmountString, // Save the amount as a string
                        }));
                        setModalAddIsOpen(true);

                        inputRef.current.value = ""; // Clear the input field
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
        }
        ,
        {
            Header: "Action", accessor: "action", Cell: ({row}) => {
                return (<div className="flex gap-1">
                    <button type="button"
                            className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2 "
                            onClick={() => handleStartAdding(row.original.id)}><ImBin/>
                    </button>
                    <button type="button"
                            className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2  "
                            onClick={() => handleStartUpdate(row.original.id)}>Modifier
                    </button>
                </div>);
            },
        },], [amounts]);

    useEffect(() => {
        if (selectedSlafId) {
            const selected = slaf.find(s => s.id === selectedSlafId);
            setSelectedSlaf(selected);
            setUpdatedAmount(selected?.amount);
            setUnit(selected?.unit);
            setUpdatedNote(selected?.note || '');
        }
    }, [selectedSlafId, slaf]);

    const handleStartUpdate = (id) => {
        setSelectedSlafId(id);

        setModalUpdateIsOpen(true);
    };
    function handleStartAdding(id) {
        setSelectedSlafId(id);
        setModalIsOpen(true);
    }






    function handleStopUpdate() {
        setModalUpdateIsOpen(false);
    }

    function handleStopAdding() {
        setModalIsOpen(false);
        setPassword(null);
    }
    const types = [{id:1,name: "DT"},{id:2,name: "EUR"}]
    async function handleDelete(id) {
        try {
            const passwordCheckResponse = await fetch('/api/auth/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    password: password,
                }),
            });

            const passwordCheckResult = await passwordCheckResponse.json();

            if (!passwordCheckResponse.ok || !passwordCheckResult.success) {
                throw new Error('Mot de passe incorrect');
            }

            const response = await fetch(`/api/Slaf/delete?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const updatedSavings = slaf.filter(s => s.id !== id);
                setSlaf(updatedSavings);
                handleStopAdding();
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
                const data = await response.json();
                console.error('Failed to delete:', data);
                setConfirmError('Error deleting product');
            }
        } catch (error) {
            console.error('Error deleting auction:', error);
            setConfirmError(error.message);

        }
    }


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} à ${hours}:${minutes}`;
    };

    if (isLoading) {
        return <LoadingPage/>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    function handleStopAddingSlaf() {
        setModalAddIsOpen(false);
        setPassword(null);
    }



    async function handleAddAmount(id) {
        try {
            const passwordCheckResponse = await fetch('/api/auth/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    password: password,
                }),
            });

            const passwordCheckResult = await passwordCheckResponse.json();

            if (!passwordCheckResponse.ok || !passwordCheckResult.success) {
                throw new Error('Mot de passe incorrect');
            }

            const response = await fetch(`/api/Slaf/updateAmount?id=${id}`, {
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
            console.error('Error updating amount:', error);
            setConfirmError(error.message);
        }
    }


    async function handleUpdate(id) {
        try {
            const passwordCheckResponse = await fetch('/api/auth/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    password: password,
                }),
            });

            const passwordCheckResult = await passwordCheckResponse.json();

            if (!passwordCheckResponse.ok || !passwordCheckResult.success) {
                throw new Error('Mot de passe incorrect');
            }

            const response = await fetch(`/api/Slaf/update?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, amount: updatedAmount,note : updatedNote,unit}),
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
            console.error('Error updating amount:', error);
            setConfirmError(error.message);
        }
    }
    const calculateTotalAmountByUnit = (slaf) => {
        if (!Array.isArray(slaf)) {
            console.error("Invalid slaf array:", slaf);
            return {};
        }

        return slaf.reduce((acc, item) => {
            const unit = item.slaf.unit || '-'; // Default to '-' if unit is missing
            const amount = parseFloat(item.value) || 0; // Use 'value' instead of 'amount'
            acc[unit] = (acc[unit] || 0) + amount; // Add to the total for the unit
            return acc;
        }, {});
    };
    const totalAmountsByUnit = calculateTotalAmountByUnit(history);
    return (
        <>

            <div className="mt-5 border-t-2 border-gray-200">
                <div className="mt-3 sm:mt-3  sm:absolute sm:left-3">
                    <button
                        className={`px-5 py-2 font-medium tracking-wider ${
                            buttonActive
                                ? 'text-white bg-gray-900 hover:bg-gray-700'
                                : 'bg-yellow-400 hover:bg-yellow-300'
                        } rounded-xl mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm`}
                        onClick={() => setButtonActive(!buttonActive)}
                    >
                        {buttonActive ? <>Voir l'historique</> : <>Voir la list de Slaf</>}
                    </button>

                </div>
                {buttonActive ? (
                    <ListSlaf columns={columns} data={slaf} />
                ) : (
                    history && history.length > 0 ? (<>
                        <div className="flex justify-center mt-4 mb-4 gap-4 flex-wrap">
                            {Object.entries(totalAmountsByUnit).map(([unit, total]) => (
                                <h1 key={unit} className="font-light leading-none tracking-tight text-gray-900 text-xl text-nowrap border-b-2 pb-2 mb-2">
                                    Montant total ({unit}): <span className="font-medium pr-1 pl-1 text-blue-700">{total.toFixed(2)}</span>
                                </h1>
                            ))}
                        </div>
                            <div className="flex justify-center mt-2">

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Nom du bijoutier</th>
                                            <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Boutique</th>
                                            <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Code</th>
                                            <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Montant</th>
                                            <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Devise</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {history.map((row, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.jeweler.name}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(row.createdAt)}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.jeweler.storeName}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.slaf.code}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.value}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.slaf.unit || '-'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </>
                    ) : (
                        <div>Aucun historique disponible</div>
                    )
                )}


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
                            Slaf ?</h3>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 rounded w-full  focus:outline-blue-500"
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
                                onClick={() => handleDelete(selectedSlafId)}
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

            <Modal open={modalAddIsOpen} onClose={handleStopAddingSlaf}>

                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={handleStopAddingSlaf}
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
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment ajouter/soustraire ce
                            montant?</h3>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 min-w-20 rounded w-full   focus:outline-blue-500 "
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
                                onClick={() => handleAddAmount(selectedSlafId)}
                                className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleStopAddingSlaf}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >No,
                            Annuler
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
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment Modifier?</h3>

                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="contact" className="text-lg font-normal text-gray-500 pr-2 w-24">
                                Devise:
                            </label>
                            <div className="flex flex-wrap justify-center gap-1">
                                <button
                                    type="button"
                                    className={`font-medium rounded-lg text-[18px] w-24  p-1 focus:outline-none ${
                                        unit && unit === "T" ? 'bg-yellow-100 shadow-xl' : 'bg-blue-200 hover:bg-blue-400 focus:ring-4 focus:ring-blue-300'
                                    }`}
                                    onClick={() => {
                                        if(unit === "T"){
                                            setUnit(null)
                                        }else{
                                            setUnit("T")
                                        }
                                    }}
                                >
                                   T
                                </button>
                                <button
                                    type="button"
                                    className={`font-medium rounded-lg text-[18px] w-24  p-1  focus:outline-none ${
                                        unit && unit === "E" ? 'bg-yellow-100 shadow-xl' : 'bg-blue-200 hover:bg-blue-400 focus:ring-4 focus:ring-blue-300'
                                    }`}
                                    onClick={() => {
                                        if(unit === "E"){
                                            setUnit(null)
                                        }else{
                                            setUnit("E")
                                        }
                                    }}
                                >
                                    E
                                </button>
                                <button
                                    type="button"
                                    className={`font-medium rounded-lg text-[18px] w-24  p-1 focus:outline-none ${
                                        unit && unit === "D" ? 'bg-yellow-100 shadow-xl' : 'bg-blue-200 hover:bg-blue-400 focus:ring-4 focus:ring-blue-300'
                                    }`}
                                    onClick={() => {
                                        if(unit === "D"){
                                            setUnit(null)
                                        }else{
                                            setUnit("D")
                                        }
                                    }}
                                >
                                    D
                                </button>
                            </div>
                            </div>

                            <div className="mb-4 flex items-center justify-start">
                                <label htmlFor="amount"
                                       className="text-lg font-normal text-gray-500 pr-2 w-24">Montant</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={updatedAmount}
                                    onChange={(e) => setUpdatedAmount(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border focus:outline-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                                />
                            </div>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="note" className="text-lg font-normal text-gray-500 pr-2 w-24">
                                Note
                            </label>
                            <textarea
                                id="note"
                                rows="5"
                                value={updatedNote || ""}
                                onChange={(e) => setUpdatedNote(e.target.value)}
                                placeholder="Entrez votre note ici..."
                                className="block p-2.5 w-full  focus:outline-blue-500 rounded-lg border border-gray-300 resize-none"
                            />
                        </div>

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 focus:outline-blue-500 min-w-20 rounded w-full  "
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
                                    onClick={() => handleUpdate(selectedSlafId)}
                                    className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
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
        </>
    );
}

export default GetSalfJeweler;