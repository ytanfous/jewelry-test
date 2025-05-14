import { useState, useRef, useEffect } from 'react';
import Modal from '@/components/bids/UI/Modal';

const ReceiveProductModal = ({ open, onClose, session, id }) => {
    const [codes, setCodes] = useState([{ code: '', error: '' }]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);


    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, codes.length);
    }, [codes]);

    const handleAddInput = () => {
        setCodes((prevCodes) => {
            const newCodes = [...prevCodes, { code: '', error: '' }];
            // Use `setTimeout` to ensure the DOM updates before focusing
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
                if (!product || product.status !== 'Lend') {
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
            const response = await fetch(`/api/products/get?userId=${session.user.id}&code=${code}&jewelerId=${id}`, {
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

    const handleModalSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/products/multipleRemoveJeweler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    state: "Active",
                    codes: codes.map((entry) => entry.code),
                    userId: session.user.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to lend products');
            }

            window.location.reload();
        } catch (error) {
            console.error('Error lending products:', error);
        } finally {
            setIsLoading(false);
            setShowConfirmationModal(false);
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

    return (
        <>
            <Modal open={open && !showConfirmationModal} onClose={onClose} >
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
                    <h2 className="text-xl font-semibold mb-4">Entrez les codes des produits à récupérer</h2>
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
                                className="p-2 border rounded w-full"
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
                            disabled={isLoading || codes.some((entry) => entry.error || !entry.code)}
                            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-200"
                        >
                            Valider
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ReceiveProductModal;
