import React, {useState} from 'react';
import Modal from "@/components/bids/UI/Modal";

function JewelerRemoveModal({ open, onClose, session, id }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmError, setConfirmError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

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

            setLoading(true);
            const response = await fetch(`/api/jewelers/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jewelerId: id }),
            });

            if (response.ok) {
                setPassword(null);
                window.location.href = '/jewelry';
            } else {
                console.error('Failed to update supplier');
                setConfirmError('Mauvais mot de passe');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
            setConfirmError(error.message);
            setLoading(false);
        }
    };



    return (
        <>
            <Modal open={open && !showConfirmationModal} onClose={onClose}>
                <div className="relative bg-white rounded-lg shadow ">
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
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500">Êtes-vous sûr ?</h1>
                        <h3 className="text-lg font-semibold mb-4">Voulez-vous vraiment supprimer ce bijoutier ?</h3>
                        <input
                            type="password"
                            placeholder="Mot de passe.... "
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

                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none disabled:bg-gray-200 focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={onClose}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-blue-100 hover:bg-blue-200 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >
                            Non, annuler
                        </button>
                    </div>
                    </div>
            </Modal>
        </>
);
}

export default JewelerRemoveModal;