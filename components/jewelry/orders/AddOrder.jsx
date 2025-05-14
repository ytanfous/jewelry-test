"use client"
import React, {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import {useFeatures} from "@/app/hooks/featuresApi";
import LoadingPage from "@/components/UI/LoadingPage";
import TypeSelector from "@/components/jewelry/products/TypeSelector";
import Calculator from "@/components/jewelry/products/Calculator";
import Modal from "@/components/bids/UI/Modal";
import DragAndDrop from "@/components/UI/DragAndDrop";
import PdfGenerator from "@/components/jewelry/orders/PdfGenerator";

function AddOrder() {
    const {data: session} = useSession();
    const {types, provenance, carat, loading} = useFeatures();
    const[isLoading, setIsLoading] = useState(false);
    const [clientCodes, setClientCodes] = useState([]);
    const [selectedClientCode, setSelectedClientCode] = useState("");
    const [filteredCodes, setFilteredCodes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClientSelected, setIsClientSelected] = useState(false);
    const [showPdfGenerator, setShowPdfGenerator] = useState(false);
    const [printData, setPrintData] = useState({});
    const [selectedType, setSelectedType] = useState({
        types: null,
        provenance: null,
        carat: null,
        weight: null,
        name: null,
        note: null,
        advance: null,
        price: null,
        image: null,
        months: null,
        code:null,
    });
    const [calculatorValue, setCalculatorValue] = useState('0');
    const [errorMessages, setErrorMessages] = useState({
        types: '',
        provenance: '',
        carat: '',
        weight: '',
        name: '',
        note: '',
        advance: '',
        price: '',
        image: '',
        months: '',

    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        const fetchClientCodes = async () => {
            try {
                const response = await fetch("/api/client/getClientsByUser");
                const data = await response.json();

                if (response.ok) {
                    setClientCodes(data); // Store the entire client objects
                    setFilteredCodes(data); // Initialize filtered list with client objects
                } else {
                    console.error("Failed to fetch client codes:", data.message);
                }
            } catch (error) {
                console.error("Error fetching client codes:", error);
            }
        };

        fetchClientCodes();
    }, []);


    function handleTypeSelect(field, value) {
        setSelectedType({
            ...selectedType, [field]: value,
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        let errors = {};


        if (Object.keys(errors).length > 0) {
            setErrorMessages(errors);
        } else {
            setErrorMessages({
                types: '', provenance: '', carat: '', weight: '', name: '', image: ''
            });
            setModalIsOpen(true);
        }
    }

    async function handleModalSubmit() {
        setIsSubmitting(true);
        setModalIsOpen(false);

        // Check if the selectedClientCode matches any valid client code
        const isValidClientCode = clientCodes.some(
            (client) => client.clientCode === selectedClientCode
        );

        let adjustedWeight = calculatorValue;
        if (calculatorValue.endsWith('.')) {
            adjustedWeight += '0';
        }

        const productData = {
            userId: session.user.id,
            orders: [{
                model: selectedType.types,
                origin: selectedType.provenance,
                carat: selectedType.carat,
                weight: adjustedWeight,
                name: selectedType.name,
                note: selectedType.note,
                advance: selectedType.advance,
                price: selectedType.price,
                months: selectedType.months,
                image: selectedType.image,
                clientCode: isValidClientCode ? selectedClientCode : null, // Set to null if not valid
            }],
            supplier: null,
        };

        try {
            setIsLoading(true);
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                const data = await response.json();
                setPrintData(data.orders[0]);

            } else {
                const errorData = await response.json();
                console.error('Error creating product:', errorData);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error creating product:', error);
        } finally {

            await setShowPdfGenerator(true);
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return <LoadingPage/>;
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
        handleTypeSelect('name', client.name); // Update the name field with the selected client's name
        setIsClientSelected(true); // Disable the input field
        setShowDropdown(false);
    };
    const handleClearClientSelection = () => {
        setSelectedClientCode("");
        handleTypeSelect('name', ""); // Clear the name field
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

    return (<>
    {
        !showPdfGenerator &&
            <div className="flex flex-col space-y-4 mx-auto">
                <div className="flex flex-wrap flex-row gap-0">

                    <div className="flex gap-1 flex-col w-full max-w-[500px] mx-auto m-1">

                        <div className="relative">
                            <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                                Code client:
                            </h1>
                            <div className="relative">
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
                                    className="bg-gray-50 border-2 outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10"
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
                        <div>
                            <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                                Nom et Prénom
                            </h1>
                            <div>
                                <input
                                    type="text"
                                    id="name"
                                    className="bg-gray-50 border-2 outline-none border-gray-300 text-gray-900 text-sm disabled:bg-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    value={selectedType.name || ''} // Bind the value to selectedType.name
                                    onChange={(e) => handleTypeSelect('name', e.target.value)} // Update the state on change
                                    placeholder="Écrivez le prénom et le nom ..."
                                    disabled={isClientSelected} // Disable the input if a client is selected
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap flex-row gap-4">
                            <div className="flex-1 min-w-[150px]">
                                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Prix</h1>
                                <div>
                                    <input
                                        type="number"
                                        id="price"
                                        className="bg-gray-50 border-2 outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        onChange={(e) => handleTypeSelect('price', e.target.value)}
                                        placeholder="Écrivez le montant..."
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Avance</h1>
                                <div>
                                    <input
                                        type="number"
                                        id="advance"
                                        className="bg-gray-50 border-2 outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        onChange={(e) => handleTypeSelect('advance', e.target.value)}
                                        placeholder="Écrivez le montant..."
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Mois</h1>
                                <div>
                                    <input
                                        type="number"
                                        id="months"
                                        min="1"
                                        className="bg-gray-50 border-2 outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        onChange={(e) => handleTypeSelect('months', e.target.value)}
                                        placeholder="Écrivez le mois..."
                                    />
                                </div>
                            </div>
                        </div>

                    <div>
                        <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Note</h1>
                        <textarea
                            id="message"
                            rows="7"
                            className="block p-2.5 w-full  mb-5  outline-none bg-gray-50 rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500  focus:border-2 resize-none"
                            placeholder="Écrivez votre note ici..."
                            value={selectedType.note || ''}
                            onChange={(e) => handleTypeSelect('note', e.target.value)}
                        ></textarea>
                    </div>
                </div>

                <div className="max-w-80 mx-auto m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Modèle</h1>
                    <TypeSelector types={types} onSelect={(value) => handleTypeSelect('types', value.name)}/>
                </div>

                <div className="flex flex-col items-center max-w-24 mx-auto m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Provenance</h1>
                    <TypeSelector types={provenance} onSelect={(value) => handleTypeSelect('provenance', value.name)}/>
                </div>

                <div className="flex flex-col items-center max-w-24 mx-auto m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Carat</h1>
                    <TypeSelector types={carat} onSelect={(value) => handleTypeSelect('carat', value.value)}/>
                </div>

                <div className="flex flex-col max-w-96 mx-auto m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Poids</h1>
                    <Calculator value={calculatorValue} onChange={setCalculatorValue}/>
                </div>
            </div>
            <DragAndDrop setSelectedType={setSelectedType} errorMessages={errorMessages} />

                <div className="flex m-1 flex-wrap gap-1 justify-end">

                {Object.keys(errorMessages).some((key) => errorMessages[key]) && (<div
                    className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none"
                         viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-center">{Object.values(errorMessages).filter((msg) => msg).join(', ')}</p>
                </div>)}

                <button
                    type="submit"
                    className={`hover:shadow-form rounded-md max-w-36 py-3 px-8 text-base font-semibold text-white mb-1 mt-1 outline-none ${isSubmitting ? 'bg-gray-500' : 'bg-blue-700 hover:bg-blue-800'}`}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Chargement...' : 'Valider'}
                </button>
            </div>
        </div>
    }
            {showPdfGenerator && <PdfGenerator formData={printData} />}

            <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <div className="relative bg-white rounded-lg shadow ">
                    <button
                        type="button"
                        onClick={() => setModalIsOpen(false)}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                        data-modal-hide="popup-modal"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>
                        <h3 className="mb-5 text-lg font-normal text-gray-500">Voulez-vous vraiment ajouter cette
                            commande
                            ?</h3>
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={handleModalSubmit}
                            className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={() => setModalIsOpen(false)}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-blue-100 hover:bg-blue-200 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >
                            Non, annuler
                        </button>
                    </div>
                </div>
            </Modal>

        </>
    );
}

export default AddOrder;