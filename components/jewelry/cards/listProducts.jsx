import React, {useEffect, useState} from "react";
import Modal from "@/components/bids/UI/Modal";
import {ImArrowLeft, ImArrowUp} from "react-icons/im";
import {TiArrowBack} from "react-icons/ti";

function ListProducts({id, session}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [productIdToRemove, setProductIdToRemove] = useState(null);
    const [stateToSet, setStateToSet] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/getProductsByJewelerId?jewelerId=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    console.error('Failed to fetch jeweler data');
                }
            } catch (error) {
                console.error('Error fetching jeweler data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);


    const handleModalSubmit = async () => {
        if (!productIdToRemove) return;

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
            setLoadingSubmit(true);
            const response = await fetch('/api/products/removeJeweler', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({productId: productIdToRemove, userId: session.user.id, state: stateToSet}),
            });

            if (response.ok) {
                // Remove the deleted product from the products state
                setProducts(products.filter(product => product.id !== productIdToRemove));
                setModalIsOpen(false); // Close the modal only if the response is ok
                setProductIdToRemove(null);
                setLoadingSubmit(false);
            } else {
                console.error('Failed to remove jeweler relation');
                setConfirmError('Failed to remove jeweler relation'); // Set error message
                setLoadingSubmit(false);
            }

        } catch (error) {
            console.error('Error removing jeweler relation:', error);
            setConfirmError(error.message); // Set error message
            setLoadingSubmit(false);
        }
    };


    const openRemoveConfirmationModal = (productId, state) => {
        setProductIdToRemove(productId);
        setStateToSet(state);
        setModalIsOpen(true);
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
        <div className="flex flex-col overflow-auto">
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
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {products.map((row, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.code}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.carat}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.weight}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.origin}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.model}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(row.date)}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-end flex justify-start gap-1 flex-row">
                                        <button type="button"
                                                className="text-yellow-600 hover:text-white border border-yellow-600 hover:bg-yellow-700 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        px-5 py-1.5 text-center me-2 mb-2 text-[16px] flex-nowrap flex gap-2 items-center"
                                                onClick={() => openRemoveConfirmationModal(row.id, 'Active')}>
                                            Rendu
                                        </button>
                                        <button type="button"
                                                className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2 mb-2 text-[16px] flex-nowrap flex gap-2 items-center "
                                                onClick={() => openRemoveConfirmationModal(row.id, 'Sold')}>Vendu
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
                <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                    <div className="relative bg-white rounded-lg shadow">
                        <button type="button" onClick={() => setModalIsOpen(false)}
                                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                data-modal-hide="popup-modal">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                        <div className="p-4 md:p-5 text-center">
                            <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>

                            {stateToSet === 'Active' &&
                                <h3 className="mb-5 text-lg font-normal text-gray-500">Voulez-vous vraiment reprendre ce
                                    bijou ?</h3>}
                            {stateToSet === 'Sold' &&
                                <h3 className="mb-5 text-lg font-normal text-gray-500">Voulez-vous vraiment vendre ce
                                    bijou ?</h3>}
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
                            <button data-modal-hide="popup-modal" type="button" onClick={handleModalSubmit} disabled={loadingSubmit}
                                    className="text-white focus:ring-4 bg-blue-500 disabled:bg-gray-300 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                Oui, je suis sûr
                            </button>
                            <button data-modal-hide="popup-modal" type="button" onClick={() => setModalIsOpen(false)}
                                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg hover:bg-blue-200 bg-blue-100 focus:z-10 focus:ring-4 focus:ring-gray-100">Non,
                                Annuler
                            </button>
                        </div>

                    </div>
                </Modal>
            )}
        </div>
    )
        ;
}

export default ListProducts;

