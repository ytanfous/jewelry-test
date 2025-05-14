"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from "next-auth/react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ListSlaf from "@/components/jewelry/Slaf/listSlaf";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BsPlus } from "react-icons/bs";
import { AiOutlineMinus } from "react-icons/ai";
import { ImBin } from "react-icons/im";
import Loading from "@/app/loading";
import Modal from "@/components/bids/UI/Modal";

function DetailsLyoum() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const [expanded, setExpanded] = useState({});
    const [slafData, setSlafData] = useState({});
    const [isLoading, setIsLoading] = useState({});
    const [error, setError] = useState(null);
    const [buttonActive, setButtonActive] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [selectedSlafId, setSelectedSlafId] = useState(null);
    const [amounts, setAmounts] = useState({});
    const [modalAddIsOpen, setModalAddIsOpen] = useState(false);
    const [modalUpdateIsOpen, setModalUpdateIsOpen] = useState(false);
    const [unit, setUnit] = useState(null);
    const [updatedAmount, setUpdatedAmount] = useState('');
    const [updatedNote, setUpdatedNote] = useState('');
    const [slaf, setSlaf] = useState([]);
    const [selectedSlaf, setSelectedSlaf] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filteredHistory, setFilteredHistory] = useState([]);

    function handleStopAdding() {
        setModalIsOpen(false);
        setPassword(null);
    }

    const handleStartUpdate = (id) => {
        setSelectedSlafId(id);
        setModalUpdateIsOpen(true);
    };

    function handleStopUpdate() {
        setModalUpdateIsOpen(false);
    }

    async function handleDelete(id) {
        try {
            if (!password) {
                setConfirmError('Veuillez entrer votre mot de passe');
                return;
            }

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

            const response = await fetch(`/api/Slaf/delete?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id));
                setSlafData((prevSlafData) => {
                    const updatedSlafData = { ...prevSlafData };
                    Object.keys(updatedSlafData).forEach((jewelerId) => {
                        updatedSlafData[jewelerId] = updatedSlafData[jewelerId].filter((slaf) => slaf.id !== id);
                    });
                    return updatedSlafData;
                });

                handleStopAdding();
                setConfirmError('');
            } else {
                const data = await response.json();
                console.error('Failed to delete:', data);
                setConfirmError('Erreur lors de la suppression du produit');
            }
        } catch (error) {
            console.error('Error deleting auction:', error);
            setConfirmError(error.message);
        }
    }

    useEffect(() => {
        async function fetchData() {
            if (session?.user?.id) {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/Slaf/getHistory?userId=${session.user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setHistory(data);
                        setFilteredHistory(data);
                    } else {
                        console.error('Failed to fetch history data');
                    }
                } catch (error) {
                    console.error('Error fetching history data:', error);
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchData();
    }, [session]);

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredHistory(history);
        } else {
            const filtered = history.filter(item =>
                item.jeweler.name.toLowerCase().includes(searchText.toLowerCase()) ||
                (item.jeweler.storeName && item.jeweler.storeName.toLowerCase().includes(searchText.toLowerCase()))
            );
            setFilteredHistory(filtered);
        }
    }, [searchText, history]);

    const groupedHistory = useMemo(() => {
        const dataToGroup = filteredHistory;
        const groups = dataToGroup.reduce((groups, row) => {
            const jewelerName = row.jeweler.name;
            if (!groups[jewelerName]) {
                groups[jewelerName] = { jeweler: row.jeweler, slaf: [] };
            }
            groups[jewelerName].slaf.push(row);
            return groups;
        }, {});

        setButtonActive((prevState) => {
            const newState = { ...prevState };
            Object.keys(groups).forEach((jewelerName) => {
                if (newState[jewelerName] === undefined) {
                    newState[jewelerName] = true;
                }
            });
            return newState;
        });

        return groups;
    }, [filteredHistory]);

    const toggleExpand = async (jewelerName, jewelerId) => {
        setExpanded((prevState) => ({
            ...prevState,
            [jewelerName]: !prevState[jewelerName],
        }));

        if (!expanded[jewelerName]) {
            setIsLoading((prev) => ({ ...prev, [jewelerId]: true }));
            try {
                const response = await fetch(`/api/Slaf/getByUserAndJeweler?userId=${session.user.id}&jewelerId=${jewelerId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setSlafData((prev) => ({ ...prev, [jewelerId]: data.slafs }));
            } catch (error) {
                console.error('Error fetching Slaf data:', error);
                setError(error.message);
            } finally {
                setIsLoading((prev) => ({ ...prev, [jewelerId]: false }));
            }
        }
    };

    const toggleButtonActive = (jewelerName) => {
        setButtonActive((prevState) => ({
            ...prevState,
            [jewelerName]: !prevState[jewelerName],
        }));
    };

    const columns = useMemo(() => [
        { Header: "Date", accessor: "createdAt", Cell: ({ value }) => (<>{formatDate(value)}</>) },
        { Header: "Code", accessor: "code" },
        { Header: "Devise", accessor: "unit", Cell: ({ value }) => (value ? value : "-") },
        { Header: "Montant", accessor: "amount" },
        {
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
        },
        {
            Header: "Ajouter un montant",
            accessor: "amountadd",
            Cell: ({ row }) => {
                const inputRef = useRef(null);

                const handleAmountChange = (id, operation) => {
                    const inputValue = inputRef.current.value.trim();

                    if (inputValue && !isNaN(inputValue)) {
                        const amount = parseFloat(inputValue);
                        const newAmount = operation === "plus" ? amount : -amount;
                        const newAmountString = newAmount.toString();

                        setSelectedSlafId(id);
                        setAmounts((prevAmounts) => ({
                            ...prevAmounts,
                            [id]: newAmountString,
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
                                if (e.target.value < 0) {
                                    e.target.value = "";
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                handleAmountChange(row.original.id, "plus");
                            }}
                            className="text-white bg-green-500 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-base px-3 py-2 focus:outline-none"
                        >
                            <BsPlus />
                        </button>
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
            Header: "Action",
            accessor: "action",
            Cell: ({ row }) => {
                return (
                    <div className="flex gap-1">
                        <button
                            type="button"
                            className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                            onClick={() => handleStartAdding(row.original.id)}
                        >
                            <ImBin />
                        </button>
                        <button
                            type="button"
                            className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                            onClick={() => handleStartUpdate(row.original.id)}
                        >
                            Modifier
                        </button>
                    </div>
                );
            },
        },
    ], []);

    function handleStartAdding(id) {
        setSelectedSlafId(id);
        setModalIsOpen(true);
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const Minute = String(date.getMinutes()).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year} à ${hours}:${Minute}`;
    };

    useEffect(() => {
        if (selectedSlafId && slaf) {
            const selected = slaf.find(s => s.id === selectedSlafId);
            setSelectedSlaf(selected);
            setUpdatedAmount(selected?.amount);
            setUnit(selected?.unit);
            setUpdatedNote(selected?.note || '');
        }
    }, [selectedSlafId, slaf]);

    useEffect(() => {
        if (slafData) {
            const flattenedSlaf = Object.values(slafData).flat();
            setSlaf(flattenedSlaf);
        }
    }, [slafData]);

    function handleStopAddingSlaf() {
        setModalAddIsOpen(false);
        setPassword(null);
    }

    async function handleUpdate(id) {
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

    async function handleAddAmount(id) {
        try {
            if (!password) {
                setConfirmError('Veuillez entrer votre mot de passe');
                return;
            }

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

            const response = await fetch(`/api/Slaf/updateAmount?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, amount: amounts[id] }),
            });

            if (response.ok) {
                const data = await response.json();

                setHistory((prevHistory) =>
                    prevHistory.map((item) =>
                        item.id === id ? { ...item, amount: data.updatedAmount } : item
                    )
                );

                setSlafData((prevSlafData) => {
                    const updatedSlafData = { ...prevSlafData };
                    Object.keys(updatedSlafData).forEach((jewelerId) => {
                        updatedSlafData[jewelerId] = updatedSlafData[jewelerId].map((slaf) =>
                            slaf.id === id ? { ...slaf, amount: data.updatedAmount } : slaf
                        );
                    });
                    return updatedSlafData;
                });
                window.location.reload()
                handleStopAddingSlaf();
                setPassword(null);
                setConfirmError('');
            } else {
                const errorData = await response.json();
                console.error('Failed to update amount:', errorData);
                setConfirmError('Erreur lors de la mise à jour du montant');
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
            const unit = item.slaf.unit || '-';
            const amount = parseFloat(item.value) || 0;
            acc[unit] = (acc[unit] || 0) + amount;
            return acc;
        }, {});
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center">


                {/* Search Bar */}
                <div className="max-w-md mx-auto mt-2 w-full">
                    <div className="relative flex items-center w-full h-12 border border-gray-200 rounded-lg shadow focus-within:border-blue-700 focus-within:border-2 bg-white overflow-hidden">
                        <div className="grid place-items-center h-full w-12 text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input
                            className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                            type="text"
                            id="search"
                            placeholder="Rechercher un bijoutier par nom..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {searchText && (
                            <div className="grid place-items-center h-full w-12 text-gray-300 cursor-pointer" onClick={() => setSearchText('')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-row gap-5 flex-wrap">
                    <h1 className="font-light leading-none tracking-tight mt-4 text-gray-900 text-2xl border-b-2 pb-2 mb-2">
                        Nombre total de bijoutiers: <span className="border-blue-800 font-medium pr-1 pl-1 text-blue-700">
                            {new Set(history.map(item => item.jeweler.id)).size}
                        </span>
                    </h1>
                </div>
                {loading ? (
                    <Loading />
                ) : (
                    <div className="lg:w-2/3 sm:w-full mx-auto mt-5 space-y-4">
                        {Object.keys(groupedHistory).length === 0 ? (
                            <div className="text-center p-4 text-gray-500">
                                Aucun bijoutier trouvé.
                            </div>
                        ) : (
                            Object.entries(groupedHistory).map(([jewelerName, group]) => {
                                const totalAmountsByUnit = calculateTotalAmountByUnit(group.slaf);

                                return (
                                    <div key={jewelerName} className="mb-4 border rounded-lg p-4">
                                        <div
                                            className="flex justify-between items-center cursor-pointer"
                                            onClick={() => toggleExpand(jewelerName, group.jeweler.id)}
                                        >
                                            <h2 className="text-lg font-semibold">
                                                {group.jeweler.name} {group.jeweler.storeName ? <> - {group.jeweler.storeName}</> : ""}
                                            </h2>
                                            <span className="text-blue-500 text-xl">
                                                {expanded[jewelerName] ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                            </span>
                                        </div>

                                        {expanded[jewelerName] && (
                                            <div className="mt-2">
                                                <button
                                                    className={`px-5 py-2 font-medium tracking-wider ${
                                                        buttonActive[jewelerName]
                                                            ? 'text-white bg-gray-900 hover:bg-gray-700'
                                                            : 'bg-yellow-400 hover:bg-yellow-300'
                                                    } rounded-xl mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm`}
                                                    onClick={() => toggleButtonActive(jewelerName)}
                                                >
                                                    {buttonActive[jewelerName] ? <>Voir la list de Slaf</> : <>Voir l'historique</>}
                                                </button>
                                                {buttonActive[jewelerName] ? (
                                                    <>
                                                        <div className="flex mt-2 gap-6 flex-wrap">
                                                            {Object.entries(totalAmountsByUnit).map(([unit, total]) => (
                                                                <div
                                                                    key={unit}
                                                                    className="bg-white rounded-lg duration-200"
                                                                >
                                                                    <h2 className="text-lg font-normal text-gray-700">
                                                                        Montant total
                                                                        <span className="font-medium text-gray-900 ml-1">({unit})</span>:
                                                                        <span className="font-semibold text-blue-600 ml-2">
                                                                            {total.toFixed(2)}
                                                                        </span>
                                                                    </h2>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <ListSlaf key={group.jeweler.id} columns={columns} data={slafData[group.jeweler.id] || []} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
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
                            className="mb-4 p-2 border-2 rounded w-full  focus:outline-blue-500 "
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
                            className="mb-4 p-2 border-2 min-w-20 rounded w-full  focus:outline-blue-500 "
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
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
                                className="block p-2.5 w-full rounded-lg border-gray-300 border focus:outline-blue-500 resize-none"
                            />
                        </div>

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 min-w-20 rounded w-full  outline-none focus:outline-blue-500 "
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

export default DetailsLyoum;