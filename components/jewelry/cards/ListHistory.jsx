import React, {useEffect, useMemo, useState} from "react";
import Modal from "@/components/bids/UI/Modal";
import {ImArrowLeft, ImArrowUp} from "react-icons/im";
import {FaEye} from "react-icons/fa";
import ListHistorySlaf from "@/components/jewelry/Slaf/ListHistorySlaf";

function ListHistory({id, session}) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedTables, setSelectedTables] = useState("Produits");
    const [products, setProducts] = useState(null);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [modalUpdateIsOpen, setModalUpdateIsOpen] = useState(false);
    const [updatedNote, setUpdatedNote] = useState('');
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

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/api/jewelers/getHistoryByJewelerId?jewelerId=${id}&userId=${session.user.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch transaction history');
                }
                const data = await response.json();
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch jeweler data');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [id, session.user.id]);


    const filteredData = useMemo(() => {
        if (selectedStatus.includes("prêté non retourne") && products.length > 0) {
            // Create a Set of valid product codes for faster lookup
            const productCodesSet = new Set(products.map(product => product.code));

            // Filter items based on whether item.product.code exists in the product codes set
            const filteredItems = history.filter(item => productCodesSet.has(item.product.code) && item.status !== "WESLET");

            // Group by item.product.code and select the latest item by date
            const groupedByCode = filteredItems.reduce((acc, item) => {
                const existingItem = acc[item.product.code];

                // If no item exists for this code or the current item is later than the stored one, update it
                if (!existingItem || new Date(item.date) > new Date(existingItem.date)) {
                    acc[item.product.code] = item;
                }

                return acc;
            }, {});

            // Return the values (most recent items by code)
            return Object.values(groupedByCode);
        }

        // Default filter if "prêté non retourne" is not selected
        return history.filter(item =>
            selectedStatus.length ? selectedStatus.includes(item.status) : true
        );
    }, [history, selectedStatus, products]);

    useEffect(() => {
        if (selectedHistoryId) {
            const selected = history.find(s => s.id === selectedHistoryId);

            setUpdatedNote(selected?.note || '');
        }
    }, [selectedHistoryId, history]);





    const productCount = useMemo(() => filteredData.length, [filteredData]);

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
        const hours = String(date.getHours()).padStart(2, '0');
        const Minute = String(date.getMinutes()).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year} à ${hours}:${Minute}`;
    };

    function handleCheckboxChange(setSelectedFunction, value) {
        setSelectedStatus(prev => {
            if (prev.includes(value)) {
                return prev.filter(item => item !== value);
            } else {
                return [...prev, value];
            }
        });
    }
    function handleCheckboxChangeTables(value) {
        setSelectedTables(value);
    }
    const statuses = [
        { value: "Active", label: "Disponible" },
        { value: "Sold", label: "Vendu" },
        { value: "Lend", label: "Prêter" },
        { value: "WESLET", label: "WESLET" }
    ];

    const handleStartUpdate = (id) => {
        setSelectedHistoryId(id);

        setModalUpdateIsOpen(true);
    };
    function handleStopUpdate() {
        setModalUpdateIsOpen(false);
    }
    async function handleUpdate(ids) {
        try {
            const response = await fetch(`/api/products/updateNote`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: ids,
                    jewelerId: id,
                    note: updatedNote,
                    userId: session.user.id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Update successful:', data);

                if (data) {
                    setModalUpdateIsOpen(false);
                }
            } else {
                const error = await response.json();
                console.error('Error from API:', error);
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }


    return (<>
            <div className="flex flex-col overflow-auto">
                <div className="mt-2">
                    <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Historique </h1>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedTables.includes("Produits") ?
                                'text-white bg-blue-700 ' : 'text-blue-700 '}`}
                            onClick={() => handleCheckboxChangeTables( "Produits")}
                        >
                            <span>Produits</span>
                        </button>
                        <button
                            type="button"
                            className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedTables.includes("Slaf") ?
                                'text-white bg-blue-700  ' : 'text-blue-700 '}`}
                            onClick={() => handleCheckboxChangeTables("Slaf")}
                        >
                            <span>Slaf</span>
                        </button>
                    </div>

                </div>
                {selectedTables.includes("Produits") &&
                <>
                    <div className="mt-2">
                        <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">État
                            du produit</h1>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedStatus.includes("Active") ?
                                    'text-white bg-blue-700  ' : 'text-blue-700 '}`}
                                onClick={() => handleCheckboxChange(setSelectedStatus, "Active")}
                            >
                                <span>Retourné</span>
                            </button>
                            <button
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedStatus.includes("Sold") ?
                                    'text-white bg-blue-700 ' : 'text-blue-700 '}`}
                                onClick={() => handleCheckboxChange(setSelectedStatus, "Sold")}
                            >
                                <span>Vendu</span>
                            </button>
                            <button
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedStatus.includes("Lend") ?
                                    'text-white bg-blue-700 ' : 'text-blue-700 '}`}
                                onClick={() => handleCheckboxChange(setSelectedStatus, "Lend")}
                            >
                                <span>Prêter</span>
                            </button>
                            <button
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedStatus.includes("WESLET") ?
                                    'text-white bg-blue-700 ' : 'text-blue-700 '}`}
                                onClick={() => handleCheckboxChange(setSelectedStatus, "WESLET")}
                            >
                                <span>WESLET</span>
                            </button>
                            <button
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedStatus.includes("deleted") ?
                                    'text-white bg-blue-700 ' : 'text-blue-700 '}`}
                                onClick={() => handleCheckboxChange(setSelectedStatus, "deleted")}
                            >
                                <span>Supprimé</span>
                            </button>
                            <button
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedStatus.includes("prêté non retourne") ?
                                    'text-white bg-blue-700  ' : 'text-blue-700   '}`}
                                onClick={() => handleCheckboxChange(setSelectedStatus, "prêté non retourne")}
                            >
                                <span>prêté non retourne</span>
                            </button>
                        </div>
                        <h1 className="font-light leading-none tracking-tight mt-4 text-gray-900 text-2xl border-b-2 pb-2 mb-2">Historique
                            total: <span
                                className="border-blue-800 font-medium  pr-1 pl-1 text-blue-700">{productCount}</span>
                        </h1>
                    </div>
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
                                            className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">PR
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Modèle
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date
                                        </th>
                                        <th scope="col"
                                            className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">note
                                        </th>

                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {filteredData.map((row, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.code}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.carat}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.weight}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.origin}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.model}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.status === "Active" &&
                                                <span
                                                    class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-green-400">Retourné</span>

                                            }
                                                {row.status === 'Lend' &&
                                                    <span
                                                        class="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-yellow-300">Prêter</span>
                                                }
                                                {row.status === 'Sold' &&
                                                    <span
                                                        class="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-indigo-400">Vendu</span>

                                                }
                                                {row.status === 'WESLET' &&
                                                    <span
                                                        class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-green-400">WESLET</span>

                                                }
                                                {row.status === 'deleted' &&
                                                    <span
                                                        class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-red-400">Supprimé</span>

                                                }
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(row.date)}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800"> {row.status === 'Lend' ?
                                                <div className="text-center">-</div> :
                                                <button type="button"
                                                        className="text-green-700  border border-green-700 hover:bg-green-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2  "
                                                        onClick={() => handleStartUpdate(row.id)}><FaEye/>
                                                </button>}

                                            </td>

                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>}
                {selectedTables.includes("Slaf") &&
                    <ListHistorySlaf userId={session.user.id} jewelerId={id}/>
                }

            </div>

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
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Note</h3>

                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="note"
                                   className="text-lg font-normal text-gray-500 pr-2 w-24">Note</label>
                            <textarea
                                id="note"
                                rows="5"
                                value={updatedNote}
                                onChange={(e) => setUpdatedNote(e.target.value)}
                                className="block p-2.5 w-full  mb-5  outline-none  rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500  focus:border-2 resize-none"

                            />
                        </div>

                        <button data-modal-hide="popup-modal" type="submit"
                                onClick={() => handleUpdate(selectedHistoryId)}
                                className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Enregistrer
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

export default ListHistory;
