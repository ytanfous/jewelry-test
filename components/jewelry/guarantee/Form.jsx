"use client";
import React, {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import {ImBin} from "react-icons/im";
import Cash from "@/components/jewelry/guarantee/Cash";
import Facilitated from "@/components/jewelry/guarantee/facilitated/Facilitated";
import Modal from "@/components/bids/UI/Modal";
import PdfGenerator from "@/components/UI/PdfGenerator";


function Form() {
    const [rows, setRows] = useState([{id: '', product: null}]);
    const [formErrors, setFormErrors] = useState({});
    const {data: session} = useSession();
    const [selectedComponent, setSelectedComponent] = useState("Facilitated");
    const [advance, setAdvance] = useState('');
    const [months, setMonths] = useState('');
    const [tableData, setTableData] = useState([]);
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [showPdfGenerator, setShowPdfGenerator] = useState(false);

    const [clientCodes, setClientCodes] = useState([]);
    const [selectedClientCode, setSelectedClientCode] = useState("");
    const [filteredCodes, setFilteredCodes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClientSelected, setIsClientSelected] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        phone: "",
        note:"",
        rows: [
            {
                id: "",
                product: null
            }
        ],
        selectedComponent: null,
        price: "",
        advance: "",
        months: "",
        tableData: [
            {
                date: "",
                checkNumber: "",
                amount: ""
            }
        ]
    });

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

    function handlePriceChangeCash(e) {
        setPrice(Number(e.target.value));
        setFormData((prevData) => ({
            ...prevData,
            price: Number(e.target.value),
        }));
    }

    function handleAdvanceChange(e) {
        setAdvance(Number(e.target.value));
        setFormData((prevData) => ({
            ...prevData,
            advance: Number(e.target.value),
        }));
    }

    function handlePriceChange(e) {
        setPrice(Number(e.target.value));
        setFormData((prevData) => ({
            ...prevData,
            price: Number(e.target.value),
        }));
    }

    const generateTable = (months) => {
        const remainingAmount = price - advance;
        const initialAmount = remainingAmount / months;

        const today = new Date();
        const data = Array.from({ length: months }, (_, index) => {
            const date = new Date(today); // Clone today's date
            date.setMonth(today.getMonth() + index +1); // Add index months to today's date

            return {
                date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
                checkNumber: '',
                amount: initialAmount,
            };
        });
        setFormData((prevData) => ({
            ...prevData,
            tableData: data,
        }));
        setTableData(data);
    };



    useEffect(() => {
        if (price && advance && months) {
            generateTable(months);
        }
    }, [price, advance, months]);


    const handleMonthsChange = (e) => {
        const value = Number(e.target.value);
        setMonths(value);
        setFormData((prevData) => ({
            ...prevData,
            months: value,
        }));
        generateTable(value);
    };

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

    const handleTableChange = (index, field, value) => {
        const updatedTableData = [...tableData];
        updatedTableData[index][field] = value;

        if (field === 'amount' && index < updatedTableData.length - 1) {
            const newAmount = Number(value);
            updatedTableData[index].amount = newAmount;

            let remainingAmount = price - advance;

            for (let i = 0; i < updatedTableData.length; i++) {
                if (i === index) {
                    updatedTableData[i].amount = newAmount;
                } else if (i > index) {
                    remainingAmount -= updatedTableData[i - 1].amount;
                    updatedTableData[i].amount = Math.max(remainingAmount);
                } else {
                    updatedTableData[i].amount = updatedTableData[i].amount || 0;
                    remainingAmount -= updatedTableData[i].amount;
                }
            }
        }
        setFormData((prevData) => ({
            ...prevData,
            tableData: updatedTableData,
        }));
        setTableData(updatedTableData);

    };


    const addRow = () => {
        setRows([...rows, {id: '', product: null}]);
    };

    const handleIdChange = async (index, event) => {
        const newRows = [...rows];
        newRows[index].id = event.target.value;
        const isDuplicate = newRows.some((entry, i) => entry.id === newRows[index].id  && i !== index);
        if (isDuplicate) {
            newRows[index].product = null;
        }else if (event.target.value) {
            const product = await fetchProductById(event.target.value);
            newRows[index].product = product;
        } else {
            newRows[index].product = null;
        }
        setFormData((prevData) => ({
            ...prevData,
            rows: newRows,
        }));
        setRows(newRows);

    };

    const removeRow = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const fetchProductById = async (code) => {
        try {
            const response = await fetch(`/api/products/get?userId=${session.user.id}&code=${code}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, max-age=0', // Do not cache the response
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            const products = await response.json();
            if (products.length > 0) {
                return products[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    };


    const handlePhoneInput = (event) => {
        const value = event.target.value.replace(/\D/g, '');
        event.target.value = value;
    };
    useEffect(() => {
        if (tableData.length > 0) {
            const totalAmount = price - advance;
            const calculatedAmount = totalAmount / tableData.length;

            // Calculate the amounts for each row and ensure two decimal places
            const updatedTableData = tableData.map((row, index) => {
                // Round each calculated amount to 2 decimal places
                const roundedAmount = (Math.round(calculatedAmount * 100) / 100).toFixed(2);

                // Ensure the last row's amount is adjusted to make the total sum correct
                if (index === tableData.length - 1) {
                    // Calculate the remaining amount to fix rounding errors
                    const remainingAmount = totalAmount - (parseFloat(roundedAmount) * (tableData.length - 1));
                    return { ...row, amount: (Math.round(remainingAmount * 100) / 100).toFixed(2) };
                }

                return { ...row, amount: roundedAmount };
            });

            setTableData(updatedTableData);
        }
    }, [price, advance, tableData.length]);

    const handleValidation = () => {
        event.preventDefault();
        const errors = {};

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const price = document.getElementById("price").value;
        const advanceElement = document.getElementById("advance");
        const advance = advanceElement ? advanceElement.value : '';
        const monthsElement = document.getElementById("months");
        const months = advanceElement ? advanceElement.value : '';

        if (selectedComponent === 'Facilitated') {
            if (!months || months < 0) {
                errors.months = "Le Number de mois ne doit pas être inférieure à 1";
            }
            if (!advance || advance < 0) {
                errors.advance = "L'avance ne doit pas être inférieure à 0";
            }
            tableData.forEach((row, index) => {

                if (!row.date) {
                    errors[`tableData-${index}-date`] = "Le date est requis. ";
                }

                if (row.amount < 0) {
                    errors[`tableData-${index}-amount`] = " ne doit pas être inférieure à 0";
                }
                if (!row.amount) {
                    errors[`tableData-${index}-checkNumber`] = "Le montante est requis.";
                }


            })
        }
        if (rows.length === 0) {
            errors.row = "la liste des articles est vide ajouter un article";
        }


        rows.forEach((row, index) => {
            if (!row.id) {
                errors[`row-${index}-id`] = "Le code est requis.";
            }
            if (!row.product) {
                errors[`row-${index}-product`] = "Article non trouvé.";
            }
        });


        setFormErrors(errors);
        if (Object.keys(errors).length === 0) {
            setModalIsOpen(true);
        }
    };


    async function handleModalSubmit() {
        setIsSubmitting(true);
        setModalIsOpen(false);
        let idForm = '';
        let codeClientForm ;
        try {
            const isValidClientCode = clientCodes.some(
                (client) => client.clientCode === selectedClientCode
            );

            const response = await fetch('/api/guarantee/create', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({userId: session.user.id, ...formData,selectedSection, selectedComponent: selectedComponent,  code: isValidClientCode ? selectedClientCode : null}),
            });

            if (response.ok) {
                const data = await response.json();
                idForm = data.id
                codeClientForm = data.codeClient
            } else {
                const errorData = await response.json();
                console.error('Error creating product:', errorData);
            }
        } catch (error) {
            console.error('Error creating product:', error);
        } finally {

            setFormData((prevData) => ({
                ...prevData,
                code: idForm,
            }));

            if (!selectedClientCode){
                setSelectedClientCode(codeClientForm);
            }
            await setShowPdfGenerator(true);
            setIsSubmitting(false);
        }
    }
    function handleTypeSelect(field, value) {
        setFormData({
            ...formData, [field]: value,
        });
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


    return (<>
            {
                !showPdfGenerator && <div className="flex w-full">
                    <form
                        className="flex flex-row flex-wrap items-start w-full"
                        onSubmit={handleValidation}
                    >
                        <div
                            className="w-full mx-auto max-w-[550px] bg-white mt-2 border border-white shadow p-4 rounded-3xl">
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
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nom et Prénom..."
                                    className="w-full rounded-md border border-[#e0e0e0] disabled:bg-gray-100 bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                    disabled={isClientSelected}
                                />
                                {formErrors.name && (
                                    <div
                                        className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             className="stroke-current shrink-0 h-4 w-4"
                                             fill="none" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <p>{formErrors.name}</p>
                                    </div>
                                )}
                            </div>
                            <div className="mb-5">
                                <label htmlFor="phone" className="mb-3 block text-base font-medium text-[#07074D]">
                                    Note :
                                </label>
                                <textarea
                                    id="message"
                                    rows="7"
                                    className="block p-2.5 w-full  mb-5  outline-none  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500  focus:border resize-none"
                                    placeholder="Écrivez votre note ici..."
                                    value={formData.note}
                                    onChange={(e) => handleTypeSelect('note', e.target.value)}
                                ></textarea>

                            </div>
                            <div className="mb-5">
                                <label htmlFor="phone" className="mb-3 block text-base font-medium text-[#07074D]">
                                    Numéro de téléphone :
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    maxLength={8}
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Numéro de téléphone..."
                                    onInput={handlePhoneInput}
                                    disabled={isClientSelected}
                                    className="w-full rounded-md border disabled:bg-gray-100 border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                />
                                {formErrors.phone && (
                                    <div
                                        className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap text-xs gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             className="stroke-current shrink-0 h-4 w-4"
                                             fill="none" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <p>{formErrors.phone}</p>
                                    </div>
                                )}
                            </div>
                            <div className="mb-5">
                                <label className="mb-3 block text-base font-medium text-[#07074D]">
                                    Articles:
                                </label>
                                <table className="w-full table-auto divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                                            Code d'article
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                                            Modèle
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {rows.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                <input
                                                    type="text"
                                                    value={row.id}
                                                    onChange={(e) => handleIdChange(index, e)}
                                                    placeholder="Code..."
                                                    className="max-w-28 rounded-md border-2 border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1]"
                                                />
                                                {formErrors[`row-${index}-id`] && (
                                                    <div
                                                        className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                                        <p>{formErrors[`row-${index}-id`]}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                {row.product ? row.product.model : 'Article non trouvé'}
                                                {formErrors[`row-${index}-product`] && (
                                                    <div
                                                        className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                                        <p>{formErrors[`row-${index}-product`]}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                <button
                                                    type="button"
                                                    className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                                    onClick={() => removeRow(index)}
                                                >
                                                    <ImBin/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                {formErrors.row && (
                                    <div
                                        className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                        <p>{formErrors.row}</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="mt-4 bg-orange-400 text-white py-2 px-4 rounded-md hover:bg-orange-600"
                                >
                                    Ajouter un Article
                                </button>
                            </div>
                            <div type="button" className="flex p-2 justify-around">

                                <button type="button"
                                        className={`mt-4 w-[49%] bg-blue-500 text-white ${selectedComponent === 'Facilitated' ? `bg-blue-700` : `bg-blue-300`} py-2 px-4 rounded-md hover:bg-blue-600`}
                                        onClick={() => setSelectedComponent('Facilitated')}>
                                    Par Facilité
                                </button>
                                <button type="button"
                                        className={`mt-4 w-[49%] bg-blue-500 text-white ${selectedComponent === 'Cash' ? `bg-blue-600` : `bg-blue-300`} py-2 px-4 rounded-md hover:bg-blue-600`}
                                        onClick={() => setSelectedComponent('Cash')}>
                                    Espèces
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col mx-auto">
                            {selectedComponent === 'Facilitated' && <Facilitated price={price}
                                                                                 advance={advance}
                                                                                 months={months}
                                                                                 handlePriceChange={handlePriceChange}
                                                                                 handleAdvanceChange={handleAdvanceChange}
                                                                                 handleMonthsChange={handleMonthsChange}
                                                                                 tableData={tableData}
                                                                                 handleTableChange={handleTableChange}
                                                                                 handleChange={handleChange}
                                                                                 formErrors={formErrors}
                                                                                 setTableData={setTableData}
                                                                                 setSelectedSection={setSelectedSection}
                                                                                 selectedSection={selectedSection}

                            />}
                            {selectedComponent === 'Cash' && <Cash price={price}
                                                                   formErrors={formErrors}
                                                                   handlePriceChange={handlePriceChangeCash}
                                                                   handleChange={handleChange}/>}
                            {selectedComponent && <button type="submit"
                                                          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"

                            >
                                Valider
                            </button>}
                        </div>
                        <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                            <div className="relative bg-white rounded-lg shadow ">
                                <button
                                    type="button"
                                    onClick={() => setModalIsOpen(false)}
                                    className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                                    data-modal-hide="popup-modal"
                                >
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                         fill="none"
                                         viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <div className="p-4 md:p-5 text-center">
                                    <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>
                                    <h3 className="mb-5 text-lg font-normal text-gray-500">Voulez-vous vraiment faire
                                        cette
                                        Garantie
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
                    </form>
                </div>
            }
            {showPdfGenerator && <PdfGenerator formData={formData} advance={advance} selectedClientCode={selectedClientCode}/>}
        </>


    )
        ;
}

export default Form;