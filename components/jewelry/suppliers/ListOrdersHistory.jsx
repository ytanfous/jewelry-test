import {useEffect, useState} from "react";
import Modal from "@/components/bids/UI/Modal";
import {ImArrowLeft, ImArrowUp} from "react-icons/im";
import {MdKeyboardDoubleArrowRight} from "react-icons/md";

function SupplierOrderHistory({id, session}) {
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        const fetchOrderHistory = async () => {
            try {
                const response = await fetch(`/api/suppliers/getHistoryBySupplierId?supplierId=${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch order history');
                }
                const data = await response.json();
                setOrderHistory(data);
            } catch (error) {
                console.error('Failed to fetch order history', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, [id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}-${day}-${year} à ${hours}:${minutes}`;
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

    return (
        <div className="flex flex-col overflow-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <table className="min-w-full overflow-scroll divide-y divide-gray-200">
                        <thead>
                        <tr>
                            <th scope="col"
                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Order ID
                            </th>
                            <th scope="col"
                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">MODÈLE
                            </th>
                            <th scope="col"
                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">PROVENANCE
                            </th>
                            <th scope="col"
                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Carat
                            </th>
                            <th scope="col"
                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">MODÈLE
                            </th>
                            <th scope="col"
                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">État
                            </th>
                            <th scope="col"
                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {orderHistory.map((order, index) => (
                            <tr key={index}>
                                {order.product && <>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.product.code}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.product.model}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.product.origin}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.product.carat}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.product.weight}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                        <span
                                            className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-green-400">
                                            Commande <MdKeyboardDoubleArrowRight
                                            className="inline-block h-4 w-4 text-green-800 ml-1"/> produit
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(order.product.createdAt)}</td>
                                </>}
                                {!order.product && <>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.order.formattedOrderId}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.order.model}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.order.origin}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.order.carat}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.order.weight}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                            <span
                                                className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-yellow-300">Nouvelle Commande</span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(order.order.createdAt)}</td>
                                </>}

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SupplierOrderHistory;
