import React, {useEffect,  useState} from 'react';
import { IoMdNotifications } from "react-icons/io";
import { useSession } from "next-auth/react";
import Modal from "@/components/bids/UI/Modal";


function NotificationPopup() {
    const { data: session } = useSession();
    const [facilitated, setFacilitated] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        if (session && session.user) {
            const fetchData = async () => {
                setLoading(true);  // Set loading to true when fetching starts
                try {
                    const response = await fetch(`/api/guarantee/facilitatedNotification?userId=${session.user.id}`);
                    const userData = await response.json();
                    setFacilitated(userData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();


        }
    }, [session]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };


    const facilitatedCount = facilitated ? facilitated.length : 0;
    async function handleChangeStatus(id, status) {
        try {
            const response = await fetch(`/api/guarantee/updateStatus`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status }),
            });
            if (response.ok) {
                // Fetch the latest facilitated list from the server
                const updatedFacilitated = await fetch(`/api/guarantee/facilitatedNotification?userId=${session.user.id}`);
                const userData = await updatedFacilitated.json();
                setFacilitated(userData);  // Update the facilitated state with the latest data
            } else {
                console.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error);
        }
    }

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
                classesModal="md:w-1/3 sm:w-full  max-h-1/3 rounded-lg  "
            >
                <div className="relative  bg-white rounded-lg shadow w-full sm:w-auto">
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
                        <h1 className="mb-5 text-[16px] font-bold text-gray-500">Notification</h1>
                        {facilitated.map((f) => (
                            <div key={f.id} className="bg-gradient-to-r from-blue-200 to-cyan-200 mb-2 rounded-lg shadow ">
                                <div
                                    className="flex items-center justify-between rounded-t-lg border-b-2 border-blue-300 border-opacity-100 bg-clip-padding px-4 pb-2 pt-2.5">
                                    <p className="font-bold text-blue-800 ">
                                        {f.guarantee.formattedGuaranteeId}
                                    </p>
                                    <div className="flex items-center ">
                                        <p className="text-xs text-neutral-600 mr-3">
                                            {formatDate(f.date)}
                                        </p>

                                        <div className="flex justify-center gap-1">
                                            <button
                                                id="inline-checkbox"
                                                type="checkbox"

                                                onClick={() => handleChangeStatus(f.id, true)}
                                                className="w-4 h-4 text-black hover:text-blue-600 rounded  cursor-pointer focus:ring-2"
                                            >                        <svg
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
                                            </svg></button>
                                        </div>
                                    </div>

                                </div>
                                <div
                                    className=" rounded-b-lg px-4 py-4 text-neutral-700 text-start">
                                    Le code Client est {f.guarantee.clientCode ? <span className="font-bold">{f.guarantee.clientCode} </span> : "-"} ,
                                    Le nom est {f.guarantee.name ? <span className="font-bold">{f.guarantee.name} </span> : "-"} ,
                                    le
                                    téléphone {f.guarantee.phone ?
                                    <span className="font-bold">{f.guarantee.phone} </span > : "-"} , le prix
                                    total {f.guarantee.price ?
                                    <span  className="font-bold">{f.guarantee.price} </span > : "-"} , l'avance déjà
                                    versée {f.guarantee.advance ?
                                    <span  className="font-bold">{f.guarantee.advance} </span > : "-"},
                                    et la valeur de la tranche à recevoir {f.amount ?
                                    <span  className="font-bold">{parseFloat(f.amount).toFixed(2)} </span > : "-"}.
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

        </>
    );
}

export default NotificationPopup;
