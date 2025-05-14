import React, {useEffect, useRef, useState} from 'react';
import {ImArrowUp, ImBin, ImPrinter} from "react-icons/im";
import Modal from "@/components/bids/UI/Modal";
import ReactToPrint from "react-to-print";
import Barcode from "react-barcode";
import {useSession} from "next-auth/react";

function ListOrders({id, session}) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [orderIdToRemove, setOrderIdToRemove] = useState(null);
    const [stateToSet, setStateToSet] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [quantityInput, setQuantityInput] = useState({});
    const [reloadOrders, setReloadOrders] = useState(false);
    const [success, setSuccess] = useState(false);
    const componentRef = useRef();
    const [createdProducts, setCreatedProducts] = useState([]);
    const [formData, setFormData] = useState({
        CompanyName: '', name: '', location: ''
    });


    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/suppliers/getOrdersBysupplierId?supplierId=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                } else {
                    console.error('Failed to fetch products');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id, reloadOrders]);


    useEffect(() => {
        if (session && session.user) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`/api/register/getUser?userId=${session.user.id}`);
                    const userData = await response.json();

                    setFormData({
                        location: userData.location || '',
                        CompanyName: userData.CompanyName || '',
                        name: userData.name || ''
                    });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchData();
        }
    }, [session]);

    const handleModalSubmit = async () => {
        if (!orderIdToRemove) return;

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

            const response = await fetch('/api/suppliers/removeOrder', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({orderId: orderIdToRemove, userId: session.user.id}),
            });

            if (response.ok) {
                setOrders(orders.filter(order => order.id !== orderIdToRemove));
                setModalIsOpen(false);
                setOrderIdToRemove(null);
                setPassword(null);
            } else {
                console.error('Failed to remove order');
                setConfirmError('Failed to remove order');
            }

        } catch (error) {
            console.error('Error removing order:', error);
            setConfirmError(error.message); // Set error message
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Check password
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

            // Create products
            const response = await fetch('/api/orders/transformOrderToProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    quantity: quantityInput[orderIdToRemove],
                    orderId: orderIdToRemove,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(true);
                const products = data.products.map((product) => ({
                    model: product.model,
                    origin: product.origin,
                    carat: product.carat,
                    weight: product.weight,
                    code: product.code,
                }));

                // Update the state with created products
                setCreatedProducts(products);

                setOrderIdToRemove(null);
                setPassword(null);
                setReloadOrders((prev) => !prev); // Trigger the useEffect to reload orders
            } else {
                console.error('Failed to remove order');
                setConfirmError('Failed to remove order');
            }
        } catch (error) {
            console.error('Error creating products:', error);
        }
    };

    const openRemoveConfirmationModal = (productId, state) => {
        setPassword(null);
        setOrderIdToRemove(productId);
        setStateToSet(state);
        setModalIsOpen(true);
    };
    const handleQuantityChange = (orderId, value) => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0) return;
        setQuantityInput(prevState => ({
            ...prevState,
            [orderId]: numericValue
        }));
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen border border-gray-200 rounded-lg">
                <div role="status">
                    <svg aria-hidden="true"
                         className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-600"
                         viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"/>
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="flex flex-col  overflow-auto">
            <div>
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full overflow-scroll divide-y divide-gray-200">
                            <thead>
                            <tr>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Code
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Carat
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Poids
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Provenance
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Modèle
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Quantité
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {orders.map((row, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.formattedOrderId}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.carat}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.weight}g</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.origin}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.model}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.quantity}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(row.createdAt)}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-end flex justify-start gap-1 flex-row">
                                        <button type="button"
                                                className="text-red-600 hover:text-white border border-red-600 hover:bg-red-700 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        px-5 py-1.5 text-center me-2 mb-2 "
                                                onClick={() => openRemoveConfirmationModal(row.id, 'Remove')}>
                                            <ImBin/>
                                        </button>
                                        <button type="button"
                                                className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2 mb-2 "
                                                onClick={() => openRemoveConfirmationModal(row.id, 'Receive')}>
                                            <ImArrowUp/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {modalIsOpen && (
                <Modal open={modalIsOpen} onClose={() => {
                    setModalIsOpen(false);
                    setConfirmError(null);
                    setCreatedProducts([]);
                }}>
                    <div className="relative bg-white rounded-lg shadow">
                        <button type="button" onClick={() => {
                            setModalIsOpen(false);
                            setConfirmError(null);
                            setCreatedProducts([]);
                            setSuccess(false);
                        }}
                                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                data-modal-hide="popup-modal">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                        {!success && <div className="p-4 md:p-5 text-center">
                            <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>

                            {stateToSet === 'Receive' && (
                                <>
                                    <h3 className="mb-5 text-lg font-normal text-gray-500">
                                        Souhaitez-vous vraiment recevoir ce(s) produit(s)?
                                    </h3>
                                    <div className="mb-4 flex items-center justify-center">
                                        <label htmlFor="quantity" className="text-lg font-normal text-gray-500 pr-2">
                                            Quantité :
                                        </label>
                                        <input
                                            type="number"
                                            value={quantityInput[orderIdToRemove]}
                                            max={orders.find((order) => order.id === orderIdToRemove)?.quantity || 0}
                                            onChange={(e) => handleQuantityChange(orderIdToRemove, e.target.value)}
                                            className="p-2 border-2 rounded w-full max-w-32 outline-none focus-within:border-blue-700 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                            {stateToSet === 'Remove' &&
                                <h3 className="mb-5 text-lg font-normal text-gray-500">Voulez-vous vraiment supprimer
                                    cette
                                    commande ?</h3>}
                            <input
                                type="password"
                                placeholder="Mot de passe"
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
                            {stateToSet === 'Remove' &&
                                <button data-modal-hide="popup-modal" type="button" onClick={handleModalSubmit}
                                        className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                    Oui, je suis sûr
                                </button>}
                            {stateToSet === 'Receive' &&
                                <button data-modal-hide="popup-modal" type="button" onClick={handleSubmit}
                                        className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                    Oui, je suis sûr
                                </button>}
                            <button data-modal-hide="popup-modal" type="button" onClick={() => {
                                setModalIsOpen(false);
                                setConfirmError(null);
                                setCreatedProducts([]);
                                setSuccess(false);
                            }}
                                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg hover:bg-blue-200 bg-blue-100 focus:z-10 focus:ring-4 focus:ring-gray-100">Non,
                                Annuler
                            </button>
                        </div>}
                        {success && (
                            <div className="flex justify-center flex-col p-3">
                                <h1 className="mb-5 text-[24px] font-bold text-gray-500">Imprimer le(s) Ticket(s)</h1>
                                <h3 className="mb-5 text-lg font-normal text-gray-500">Veuillez confirmer l'impression
                                    du ticket.</h3>
                                <ReactToPrint
                                    trigger={() => (
                                        <button
                                            type="button"
                                            className="hover:shadow-form rounded-md py-3 px-8 gap-4 flex justify-center items-center text-base font-semibold text-white mb-1 mt-1 outline-none bg-blue-500 hover:bg-blue-700"
                                        >
                                            <p> impression du ticket</p> <ImPrinter/>
                                        </button>
                                    )}
                                    content={() => componentRef.current}
                                    onAfterPrint={() => {
                                        setModalIsOpen(false);
                                        setConfirmError(null);
                                        setCreatedProducts([]);
                                        setSuccess(false);
                                    }}
                                />
                                <div ref={componentRef} className="printable-content hidden print:block">
                                    {createdProducts && createdProducts.map((product, index) => (
                                        <div key={index} className="w-[72mm] h-[10mm] mb-4 print:block">
                                            <div className="flex h-full" style={{fontSize: '3mm'}}>
                                                <div
                                                    style={{
                                                        width: '20mm',
                                                        marginRight: '4mm',
                                                        marginLeft: '2mm',
                                                        alignItems: 'center',
                                                        display: 'flex',
                                                        justifyContent: 'space-around',
                                                        flexDirection: 'column',
                                                        maxWidth: '20mm',
                                                        marginTop: '2mm'
                                                    }}
                                                >
                                                    <Barcode
                                                        value={product.code.padStart(2, '0')}
                                                        height={40}
                                                        width={2}
                                                        displayValue={false}
                                                        margin={0}

                                                    />
                                                    <p style={{

                                                        fontSize: '2mm',
                                                    }}
                                                    >{product.code.padStart(2, '0')}</p>

                                                </div>
                                                <div
                                                    style={{
                                                        width: '20mm',
                                                        maxHeight: '8mm',
                                                        display: 'flex',
                                                        alignItems: 'start',
                                                        flexDirection: 'column',
                                                        marginTop: '2mm',
                                                        fontSize: '2mm',
                                                    }}
                                                >

                                                    <div className="m-0 p-0">{product.model}</div>
                                                    <div className="m-0 p-0 text-[9px]">
                                                        26{product.weight.toString().replace('.', '')}18
                                                        / {product.carat}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        )}

                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ListOrders;