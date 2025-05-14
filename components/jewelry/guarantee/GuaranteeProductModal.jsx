import React, {useState, useRef, useEffect} from 'react';
import Modal from '@/components/bids/UI/Modal';

const GuaranteeProductModal = ({open, onClose, session}) => {
    const [codes, setCodes] = useState([{code: '', error: ''}]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientCodes, setClientCodes] = useState([]);
    const [selectedClientCode, setSelectedClientCode] = useState("");
    const [filteredCodes, setFilteredCodes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClientSelected, setIsClientSelected] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        phone: "",
        note: "",
        price: "",
    });

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, codes.length);
    }, [codes]);
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

    const handleAddInput = () => {
        setCodes((prevCodes) => {
            const newCodes = [...prevCodes, {code: '', error: ''}];
            setTimeout(() => {
                inputRefs.current[newCodes.length - 1]?.focus();
            }, 0);
            return newCodes;
        });
    };


    const handleInputChange = async (index, value) => {
        const newCodes = [...codes];
        newCodes[index].code = value;
        newCodes[index].error = '';

        const isDuplicate = newCodes.some((entry, i) => entry.code === value && i !== index);
        if (isDuplicate) {
            newCodes[index].error = 'Ce code existe déjà dans la liste';
            setCodes(newCodes);
            return;
        }

        if (value) {
            try {
                const product = await fetchProductById(value);
                if (!product || product.status !== 'Active') {
                    newCodes[index].error = `Le produit n'est pas disponible`;
                }
            } catch (error) {
                newCodes[index].error = 'Error checking product availability';
                console.error(error);
            }
        }

        setCodes(newCodes);
    };


    const handleRemoveInput = (index) => {
        const newCodes = codes.filter((_, i) => i !== index);
        setCodes(newCodes);

        if (newCodes.length > 0) {
            inputRefs.current[newCodes.length - 1]?.focus();
        }
    };

    const fetchProductById = async (code) => {
        try {
            const response = await fetch(`/api/products/fetchProductById?userId=${session.user.id}&code=${code}&status=Active`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, max-age=0',
                },
            });
            if (!response.ok) return null;
            const products = await response.json();
            return products.length > 0 ? products[0] : null;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    };


    useEffect(() => {
        if (open && inputRefs.current.length > 0) {
            inputRefs.current[0]?.focus();
        }
    }, [open]);

    useEffect(() => {
        // Focus on the last input only when a new input is added
        if (codes.length > inputRefs.current.length) {
            inputRefs.current[codes.length - 1]?.focus();
        }
    }, [codes]);

    function handleChange(event) {
        const {name, value} = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    async function handleModalSubmit() {
        setIsSubmitting(true);
        try {
            const isValidClientCode = clientCodes.some(
                (client) => client.clientCode === selectedClientCode
            );

            const response = await fetch('/api/guarantee/createDirectly', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    codeClient: isValidClientCode ? selectedClientCode : null, ...formData,
                    rows: codes.map((entry) => entry.code)
                }),
            });

            if (response.ok) {
                const data = await response.json();
                window.location.reload();
            } else {
                setIsSubmitting(false);

            }
        } catch (error) {
            setIsSubmitting(false);

            console.error('Error creating product:', error);
        }
    }

    function handleTypeSelect(field, value) {
        setFormData({
            ...formData, [field]: value,
        });
    }

    const handleInputChangeClient = (e) => {
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


    return (
        <>
            <Modal open={open && !showConfirmationModal} onClose={onClose}>
                <div className="p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        data-modal-hide="popup-modal"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" viewBox="0 0 14 14">
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
                    <h2 className="text-xl font-semibold mb-4">Entrez les Informations</h2>
                    <div className="mb-4 flex items-center justify-start relative">
                        <label htmlFor="contact" className="text-lg font-normal text-gray-500 pr-2 w-24">
                            Code client:
                        </label>

                        <div className="relative flex-1">
                            <input
                                type="text"
                                id="clientCode"
                                name="clientCode"
                                value={selectedClientCode}
                                onChange={handleInputChangeClient}
                                onFocus={() => {
                                    setFilteredCodes(clientCodes); // Show all codes on focus
                                    setShowDropdown(true);
                                }}
                                onBlur={handleInputBlur} // Check for matches when the input loses focus
                                onKeyDown={handleInputKeyDown} // Check for matches when "Enter" is pressed
                                placeholder="Sélectionnez ou entrez le code client"
                                className="p-2 border-2 rounded w-full outline-none focus-within:border-gray-700 focus:ring-gray-500"
                            />

                            {selectedClientCode && ( // Show "X" button if a client is selected
                                <button
                                    type="button"
                                    onClick={handleClearClientSelection}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
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

                            {showDropdown && (
                                <ul className="absolute left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-48 overflow-auto z-10">
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
                    </div>

                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="contact" className="text-lg font-normal text-gray-500 pr-2 w-24">
                            Nom et Prénom
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder=" Nom et Prénom..."
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isClientSelected}
                            className="p-2 border-2 rounded flex-1 disabled:bg-gray-100  outline-none focus-within:border-gray-700 focus:ring-gray-500"
                        />
                    </div>
                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="phone" className="text-lg font-normal text-gray-500 pr-2 w-24">
                            Numéro téléphone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            disabled={isClientSelected}
                            maxLength={8}
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Numéro de téléphone..."
                            className="p-2 border-2 rounded flex-1 disabled:bg-gray-100  outline-none focus-within:border-gray-700 focus:ring-gray-500"/>
                    </div>
                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="contact" className="text-lg font-normal text-gray-500 pr-2 w-24">
                            Montant
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            placeholder="Montant..."
                            value={formData.price}
                            onChange={handleChange}
                            className="p-2 border-2 rounded flex-1 outline-none focus-within:border-gray-700 focus:ring-gray-500"
                        />
                    </div>
                    <div className="mb-4 flex    justify-start">
                        <label htmlFor="note"
                               className="text-lg font-normal text-gray-500 pr-2 w-24">Note</label>
                        <textarea
                            id="note"
                            rows="5"
                            value={formData.note}
                            placeholder="Note..."
                            onChange={(e) => handleTypeSelect('note', e.target.value)}
                            className="p-2 border-2 rounded flex-1 outline-none focus-within:border-gray-700 focus:ring-gray-500 resize-none"

                        />
                    </div>
                    {codes.map((entry, index) => (
                        <div key={index} className="mb-4 flex items-center space-x-4">
                            <input
                                ref={(el) => {
                                    if (el) inputRefs.current[index] = el;
                                }}
                                type="text"
                                placeholder={`Code produit ${index + 1}`}
                                value={entry.code}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault(); // Prevent default behavior like form submission
                                        handleAddInput();
                                    }
                                }}
                                className="p-2  rounded w-full border-2
outline-none focus-within:border-gray-700 focus:ring-gray-500"
                            />
                            {entry.error && <p className="text-red-500 text-sm">{entry.error}</p>}
                            <button
                                onClick={() => handleRemoveInput(index)}
                                disabled={index === 0 && codes.length === 1}
                                className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-200"
                            >
                                Enlever
                            </button>
                        </div>
                    ))}

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleAddInput}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Ajouter un autre produit
                        </button>
                        <button
                            onClick={handleModalSubmit}
                            disabled={isLoading || isSubmitting || codes.some((entry) => entry.error || !entry.code)}
                            className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-200"
                        >
                            Valider
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default GuaranteeProductModal;
