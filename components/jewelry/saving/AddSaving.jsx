"use client"
import React, {useEffect, useRef, useState} from 'react';
import {useSession} from "next-auth/react";
import Modal from "@/components/bids/UI/Modal";
import {BiSolidHide, BiSolidShow} from "react-icons/bi";
import {FaKeyboard, FaRegKeyboard} from "react-icons/fa";
import OnScreenKeyboard from "@/components/UI/OnScreenKeyboard";
import PdfGenerator from "@/components/jewelry/saving/PdfGenerator";
import ListSavings from "@/components/jewelry/saving/ListSavings";
import AddPdfGenerator from "@/components/jewelry/saving/addPdfGenerator";

function AddSaving() {
    const {data: session} = useSession();
    const [showKeyboard, setShowKeyboard] = useState(false);
    const inputRef = useRef(null);
    const [isloading, setIsloading] = useState(false);
    const [showPdfGenerator, setShowPdfGenerator] = useState(false);
    const [clientCodes, setClientCodes] = useState([]);
    const [selectedClientCode, setSelectedClientCode] = useState("");
    const [filteredCodes, setFilteredCodes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClientSelected, setIsClientSelected] = useState(false);
    const [codeClientForm, setCodeClientForm] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        note:'',
        amount: 0,
        userId: null,
        code:null,
        createdAt:null,
    });
    const [formErrors, setFormErrors] = useState({});

    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/client/gets?userId=${session.user.id}`);

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setClientCodes(data); // Store the entire client objects
                    setFilteredCodes(data); // Initialize filtered list with client objects

                    if (!Array.isArray(data)) {
                        throw new Error('Data is not an array');
                    }
                } catch (error) {
                    console.error('Error fetching clients:', error);
                } 
            }
        };
        fetchData();
    }, [session]);

    useEffect(() => {
        if (session && session.user) {
            setFormData((prevData) => ({
                ...prevData,
                userId: session.user.id
            }));
        }
    }, [session]);

    function handleChange(event) {
        const {name, value} = event.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 8) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: numericValue,
                }));
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const formErrors = {};

        if (!formData.name.trim()) {
            formErrors.name = 'Le nom est requis';
        }

/*        if (!/^\d{8}$/.test(formData.phone)) {
            formErrors.phone = 'Le numéro de téléphone doit comporter 8 chiffres';
        }

        if (!formData.location.trim()) {
            formErrors.location = 'La localisation est requis';
        }*/

        if (!formData.amount || formData.amount.length < 0) {
            formErrors.amount = 'Le montant ne doit pas être négative';
        }
        setFormErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            setModalIsOpen(true);
        }
    }

    async function handleModalSubmit() {
        setIsloading(true);

        let idForm = '';
        let hhh ;
        let cat ;
        try {
            const isValidClientCode = clientCodes.some(
                (client) => client.clientCode === selectedClientCode
            );
            const response = await fetch('/api/savings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    code: isValidClientCode ? selectedClientCode : null
                }),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("hhhh ",data.codeClient)
                idForm = data.id;
                hhh = data.codeClient;
                cat = data.createdAt;

            }

        } catch (error) {
            setIsloading(false);
            console.error(error);
        } finally {
            setModalIsOpen(false);

            setFormData((prevData) => ({
                ...prevData,
                code: idForm,
                createdAt: cat,
            }));

                setCodeClientForm(hhh);
            await setShowPdfGenerator(true);
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSelectedClientCode(value);

        if (value.trim() === "") {
            setFilteredCodes(clientCodes); // Show all when empty
        } else {
            const filtered = clientCodes.filter(client =>
                client.clientCode.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCodes(filtered);
        }
        setShowDropdown(true);
    };

    const handleSelectCode = (client) => {
        setSelectedClientCode(client.clientCode);
        setFormData((prevData) => ({
            ...prevData,
            name: client.name,
            phone: client.phone,
            location: client.location,
        }));
        setIsClientSelected(true); // Disable the input field
        setShowDropdown(false);
    };

    const handleClearClientSelection = () => {
        setSelectedClientCode("");
        setFormData((prevData) => ({
            ...prevData,
            name: "",
            phone: "",
            location: "",
        }));
        setIsClientSelected(false); // Re-enable the input field
    };

    const handleInputBlur = () => {
        const matchedClient = clientCodes.find(
            (client) => client.clientCode === selectedClientCode
        );

        if (matchedClient) {
            // If the typed value matches a client code, treat it as a selection
            handleSelectCode(matchedClient);
        } else {
            // If no match, clear the selection
            handleClearClientSelection();
        }
        setShowDropdown(false);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            const matchedClient = clientCodes.find(
                (client) => client.clientCode === selectedClientCode
            );

            if (matchedClient) {
                // If the typed value matches a client code, treat it as a selection
                handleSelectCode(matchedClient);
            } else {
                // If no match, clear the selection
                handleClearClientSelection();
            }
            setShowDropdown(false);
        }
    };



    return (
        <>


            {!showPdfGenerator &&           <div className="flex items-center justify-center ">
                <div className="mx-auto w-full max-w-[550px] bg-white mt-4 border border-white shadow-lg rounded-3xl">
                    <form className="py-4 px-9" onSubmit={handleSubmit}>
                        <div className="relative">

                            <label htmlFor="name" className="mb-3 block text-base font-medium text-[#07074D]">
                                Code client:
                            </label>

                            <div className="relative mb-5">
                                <input
                                    type="text"
                                    id="clientCode"
                                    name="clientCode"
                                    value={selectedClientCode}
                                    onChange={handleInputChange}
                                    onFocus={() => {
                                        setFilteredCodes(clientCodes); // Show all codes on focus
                                        setShowDropdown(true);
                                    }}
                                    onBlur={handleInputBlur} // Check for matches when the input loses focus
                                    onKeyDown={handleInputKeyDown} // Check for matches when "Enter" is pressed
                                    placeholder="Sélectionnez ou entrez le code client"
                                    className="w-full rounded-md border border-[#e0e0e0] disabled:bg-gray-100 bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                />
                                {selectedClientCode && ( // Show "X" button if a client is selected
                                    <button
                                        type="button"
                                        onClick={handleClearClientSelection}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-red-600 hover:text-red-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {showDropdown && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-48 overflow-auto">
                                    {filteredCodes.map((client) => (
                                        <li
                                            key={client.clientCode}
                                            className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                                            onMouseDown={() => handleSelectCode(client)}
                                        >
                                            {client.clientCode}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mb-5">
                            <label htmlFor="name" className="mb-3 block text-base font-medium text-[#07074D]">
                                Nom et Prénom :
                            </label>

                            <div className="flex relative items-center">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="example"
                                    className="w-full rounded-md border border-[#e0e0e0] disabled:bg-gray-100 bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                    value={formData.name}
                                    onChange={handleChange}
                                    ref={inputRef}
                                    disabled={isClientSelected}
                                />
                                {/*                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center px-2 border-l border-gray-300"
                                    onClick={toggleKeyboardVisibility}
                                >
                                    {showKeyboard ? <FaKeyboard/> : <FaRegKeyboard/>}
                                </button>*/}
                            </div>
                            {/*{showKeyboard && <OnScreenKeyboard onKeyPress={handleKeyPress}/>}*/}

                            {formErrors.name && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.name}</p>
                                </div>
                            )}
                        </div>
                        <div className="mb-5">
                            <label htmlFor="phone" className="mb-3 block text-base font-medium text-[#07074D]">
                                Numéro de téléphone :
                            </label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                placeholder="12345678"
                                className="w-full rounded-md border border-[#e0e0e0] disabled:bg-gray-100 bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={8}
                                disabled={isClientSelected}
                            />
                            {formErrors.phone && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.phone}</p>
                                </div>
                            )}
                        </div>
                        <div className="mb-5">
                            <label htmlFor="name" className="mb-3 block text-base font-medium text-[#07074D]">
                                Localisation :
                            </label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                placeholder="example"
                                className="w-full rounded-md border border-[#e0e0e0] disabled:bg-gray-100 bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                value={formData.location}
                                onChange={handleChange}
                                disabled={isClientSelected}
                            />
                            {formErrors.location && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.location}</p>
                                </div>
                            )}
                        </div>
                        <div className="mb-5">
                            <label htmlFor="name" className="mb-3 block text-base font-medium text-[#07074D]">
                                Note :
                            </label>
                            <textarea
                                rows="3"
                                name="note"
                                id="note"
                                placeholder="example"
                                className="w-full rounded-md border resize-none  border-[#e0e0e0] disabled:bg-gray-100 bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                value={formData.note}
                                onChange={handleChange}
                                disabled={isClientSelected}
                            />
                            {formErrors.note && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.note}</p>
                                </div>
                            )}
                        </div>
                        <div className="mb-5">
                            <label htmlFor="phone" className="mb-3 block text-base font-medium text-[#07074D]">
                                Montant :
                            </label>
                            <input
                                type="number"
                                name="amount"
                                id="amount"
                                placeholder="12345678"
                                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                value={formData.amount}
                                onChange={handleChange}
                                maxLength={8}
                            />
                            {formErrors.amount && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.amount}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <button type="submit" disabled={isloading}
                                    className="hover:shadow-form rounded-md bg-blue-700 hover:bg-blue-800 w-full py-3 px-8 text-base font-semibold text-white outline-none">
                                Valider
                            </button>
                        </div>
                    </form>
                </div>
            </div>}

            {showPdfGenerator && <div className="flex flex-col p-4 ">
                <AddPdfGenerator formData={formData} updatedClientCode={codeClientForm}/>
            </div>}
            <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={() => setModalIsOpen(false)}
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
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment ajouter cette
                            épargne ?</h3>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleModalSubmit} disabled={isloading}
                                className="text-white focus:ring-4 bg-blue-500 disabled:bg-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            Oui, je suis sûr
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={() => setModalIsOpen(false)}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg hover:bg-blue-200 bg-blue-100 focus:z-10 focus:ring-4 focus:ring-gray-100">No,
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default AddSaving;