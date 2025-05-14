import React, {useEffect, useMemo, useState} from 'react';
import { IoMdNotifications } from "react-icons/io";
import { useSession } from "next-auth/react";
import Modal from "@/components/bids/UI/Modal";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import StateCheck from "@/components/jewelry/guarantee/facilitated/StateCheck";
import FilterableTable from "@/components/jewelry/guarantee/facilitated/FilterableTable";

function Notification() {
    const { data: session } = useSession();
    const [facilitated, setFacilitated] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        if (session && session.user) {
            const fetchData = async () => {
                setLoading(true);  // Set loading to true when fetching starts
                try {
                    const response = await fetch(`/api/guarantee/facilitatedTodayByUser?userId=${session.user.id}`);
                    const userData = await response.json();
                    setFacilitated(userData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();

/*            const intervalId = setInterval(fetchData, 60000);

            return () => clearInterval(intervalId);*/
        }
    }, [session]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const columns = useMemo(() => [
        {Header: "Code", accessor: "guarantee.formattedGuaranteeId"},
        {
            Header: "Nom", accessor: "guarantee.name", Cell: ({value}) => {
                return value ? <>{value}</> : <div className="text-3xl">-</div>
            }
        },
        {Header: "Téléphone", accessor: "guarantee.phone",
            Cell: ({ value }) => (value ? value : <>0</>),
        },
        {Header: "Prix", accessor: "guarantee.price",
            Cell: ({ value }) => (value ? value : <>0</>),
        },
        {Header: "Avance", accessor: "guarantee.advance",
            Cell: ({ value }) => (value ? value : <>0</>),
        },

        {Header: "date", accessor: "date",
            Cell: ({ value }) => (value ? formatDate(value) : <>-</>),
        },
        {Header: "Montant", accessor: "amount",
            Cell: ({ value }) => (value ? value : <>-</>),
        },

        {Header: "Note", accessor: "guarantee.note",
            Cell: ({ value }) => {

                const [showNote, setShowNote] = useState(false);

                return (
                    <div className="flex items-center  gap-2">
                        <span
                            className={`max-w-[300px] break-words h-auto text-wrap text-justify ${
                                showNote ? (value && "w-[180px]")  : " line-clamp-1"
                            }`}
                        >
                    {showNote ? value : "••••••"}
                </span>
                        <button
                            type="button"
                            onClick={() => setShowNote(!showNote)}
                            className="text-green-500 hover:text-white border border-green-500 hover:bg-green-600 focus:ring-4
                focus:outline-none focus:ring-green-300 font-medium rounded-lg
                text-sm p-1 ml-2 text-center me-2  "
                        >
                            {showNote ? <FaEyeSlash/> : <FaEye/>}
                        </button>
                    </div>
                );
            },
        }, {
            Header: "État ", accessor: "status", Cell: ({value, row}) => {
                return (<StateCheck id={row.original.id} value={value} setFacilitated={setFacilitated}/>

                );
            },
        }
    ], [setFacilitated]);

    const facilitatedCount = facilitated ? facilitated.length : 0;

    return (<>
            <button
                type="button"
                onClick={() => setModalIsOpen(true)}
                className={`absolute top-4 right-4 inline-flex items-center p-4 text-lg font-medium text-center text-white rounded-lg  focus:ring-4 focus:outline-none focus:ring-blue-300 
        ${loading || facilitatedCount === 0 ? 'bg-gray-400 ' : 'bg-blue-700 hover:bg-blue-800'}`}
                disabled={loading || facilitatedCount === 0}
            >
                <IoMdNotifications/>
                <span className="sr-only">Notifications</span>
                <div
                    className={`absolute inline-flex items-center justify-center text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2
            ${facilitatedCount > 99 ? 'w-7 h-7 text-sm' : 'w-6 h-6'}`}
                >
                    {loading ? (
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            ></path>
                        </svg>
                    ) : (
                        facilitatedCount > 99 ? '+99' : facilitatedCount
                    )}
                </div>
            </button>

            <Modal
                open={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                classesModal="max-w-full sm:max-w-fit max-h-full rounded-lg"
            >
                <div className="relative bg-white rounded-lg shadow w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => setModalIsOpen(false)}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        data-modal-hide="popup-modal"
                    >
                        <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                        >
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
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[16px] font-bold text-gray-500">List du jour</h1>
                        <FilterableTable columns={columns} data={facilitated}/>
                    </div>
                </div>
            </Modal>

        </>
    );
}

export default Notification;
