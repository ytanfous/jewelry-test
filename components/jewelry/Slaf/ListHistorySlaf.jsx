import React, {useEffect, useMemo, useState} from 'react';
import {FaEye} from "react-icons/fa";
import Modal from "@/components/bids/UI/Modal";

function ListHistorySlaf({jewelerId, userId}) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [modalUpdateIsOpen, setModalUpdateIsOpen] = useState(false);
    const [updatedNote, setUpdatedNote] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/api/jewelers/getHistoryByJewelerIdInSlaf?jewelerId=${jewelerId}&userId=${userId}`);
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
    }, [jewelerId, userId]);

    useEffect(() => {
        if (selectedHistoryId) {
            const selected = history.find(s => s.id === selectedHistoryId);

            setUpdatedNote(selected?.note || '');
        }
    }, [selectedHistoryId, history]);

    const handleStartUpdate = (id) => {
        setSelectedHistoryId(id);

        setModalUpdateIsOpen(true);
    };

    function handleStopUpdate() {
        setModalUpdateIsOpen(false);
    }

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

    async function handleUpdate(id) {
        try {
            const response = await fetch(`/api/Slaf/updateNote`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    jewelerId,
                    note: updatedNote,
                    userId,
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

    const productCount =history.length;

    return (
        <>
            <div className="flex flex-col overflow-auto">
                <div className="flex flex-wrap gap-2">
                    <h1 className="font-light leading-none tracking-tight mt-4 text-gray-900 text-2xl border-b-2 pb-2 mb-2">Historique
                        total: <span
                            className="border-blue-800 font-medium  pr-1 pl-1 text-blue-700">{productCount}</span>
                    </h1>
                </div>
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full overflow-scroll divide-y divide-gray-200">
                            <thead>
                            <tr>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Code
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Montant
                                </th>
                                <th scope="col"
                                    className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Type
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
                            {history.map((row, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.slaf.code}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.value}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.slaf.unit}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(row.createdAt)}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                                        <button type="button"
                                                className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2  "
                                                onClick={() => handleStartUpdate(row.id)}><FaEye/>
                                        </button>
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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

export default ListHistorySlaf;