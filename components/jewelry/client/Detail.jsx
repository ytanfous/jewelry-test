"use client"
import React, {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import Loading from "@/app/loading";
import TableClientSaving from "@/components/jewelry/client/TableClientSaving";
import TableClientGuarantee from "@/components/jewelry/client/TableClientGuarantee";
import {ImEye} from "react-icons/im";
import ImageOrderModal from "@/components/jewelry/orders/ImageOrderModal";
import Modal from "@/components/bids/UI/Modal";

function Detail({id}) {
    const {data: session} = useSession();
    const router = useRouter();
    const [client, setClient] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState("commandes");
    const [selectedSectionOrder, setSelectedSectionOrder] = useState("commandes");
    const [selectedSectionSaving, setSelectedSectionSaving] = useState("Ma7lol");
    const [selectedSectionGuarantee, setSelectedSectionGuarantee] = useState("Facilité");
    const [modalImageIsOpen, setModalImageIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [modalUpdateIsOpen, setModalUpdateIsOpen] = useState(false);
    const [updatedLocation, setUpdatedLocation] = useState('');
    const [updatedPhone, setUpdatedPhone] = useState('');
    const [updatedName, setUpdatedName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    useEffect(() => {

            setUpdatedName(client?.name);
            setUpdatedPhone(client?.phone);
            setUpdatedLocation(client?.location);
    }, [client]);
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/client/${id}`);

                if (response.ok) {
                    const data = await response.json();

                    if (!data || Object.keys(data).length === 0) {
                        // Redirect if client doesn't exist
                        router.push('/jewelry');
                        return;
                    }

                    if (session.user.id !== data.userId) {
                        router.push('/jewelry');
                        return;
                    }
                    console.log(data);
                    setClient(data);
                } else {
                    router.push('/jewelry'); // Redirect if response is not OK
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données du client:', error);
                router.push('/jewelry'); // Redirect in case of an error
            } finally {
                setLoading(false);
            }
        }

        if (id && session) { // Ensure session is defined before fetching data
            fetchData();
        }
    }, [id, session, router]);

    if (loading) {
        return <Loading/>;
    }


    if (!client || Object.keys(client).length === 0) {
        return <div>Aucune donnée client trouvée.</div>;
    }

    const handleCloseModal = () => {
        setModalImageIsOpen(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} à ${hours}:${minutes}`;
    };

    const handleStartUpdate = () => {
        setModalUpdateIsOpen(true);
    };

    function handleStopUpdate() {
        setModalUpdateIsOpen(false);
    }

    async function handleUpdate(id) {
        try {
            setLoading(true);

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
                setLoading(false);

                throw new Error('Mot de passe incorrect');
            }
            const response = await fetch(`/api/client/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({clientCode: client.clientCode, location : updatedLocation,name : updatedName, phone : updatedPhone,userId: session.user.id}),
            });
            if (response.ok) {
                const data = await response.json();

                window.location.reload();
                setPassword(null);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error updating amount:', error);
            setLoading(false);

            setConfirmError(error.message);
        }
    }
    return (<>
            <div className="max-w-7xl w-full mx-auto z-10">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex justify-between">
                        <h2 className="text-2xl font-bold mb-4 text-blue-600">Informations du Client</h2>
                        <button
                            className={`px-4  rounded-lg font-semibold bg-black text-white hover:bg-gray-700`}
                            onClick={handleStartUpdate}
                        >
                            Modifier
                        </button>
                    </div>

                    {/* Informations de base */}
                    <div className="mb-6">

                        <h3 className="text-xl font-semibold mb-2 text-gray-700">Coordonnées</h3>
                        <div className=" text-gray-600">
                            <p><strong>Nom:</strong> {client?.name || '-'}</p>
                            <p><strong>Téléphone:</strong> {client?.phone || '-'}</p>
                            <p><strong>Localisation:</strong> {client?.location || '-'}</p>
                            <p><strong>Code Client:</strong> {client?.clientCode || '-'}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-700">Détails </h3>
                        {/* Boutons de sélection */}
                        <div className="flex space-x-4 mb-6">
                            <button
                                className={`px-4 py-2 rounded-lg font-semibold ${selectedSection === "commandes" ? "bg-black text-white" : "bg-gray-200"}`}
                                onClick={() => setSelectedSection("commandes")}
                            >
                                Commandes
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg font-semibold ${selectedSection === "economies" ? "bg-black text-white" : "bg-gray-200"}`}
                                onClick={() => setSelectedSection("economies")}
                            >
                                Ma7lol
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg font-semibold ${selectedSection === "garanties" ? "bg-black text-white" : "bg-gray-200"}`}
                                onClick={() => setSelectedSection("garanties")}
                            >
                                Facilité
                            </button>
                        </div>

                        {/* Affichage conditionnel en fonction de la sélection */}
                        {selectedSection === "commandes" && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">Commandes</h3>
                                <div className="flex space-x-4 mb-6">
                                    <button
                                        className={`px-4 py-2 rounded-lg font-semibold ${selectedSectionOrder === "commandes" ? "bg-black text-white" : "bg-gray-200"}`}
                                        onClick={() => setSelectedSectionOrder("commandes")}
                                    >
                                        Commandes
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-lg font-semibold ${selectedSectionOrder === "Historique" ? "bg-black text-white" : "bg-gray-200"}`}
                                        onClick={() => setSelectedSectionOrder("Historique")}
                                    >
                                        Historique
                                    </button>
                                </div>
                                {client.orders && client.orders.length > 0 ? (
                                    <>
                                        {selectedSectionOrder === "commandes" ?
                                            <ul className="space-y-2">
                                                {client.orders
                                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                    .map((order) => (
                                                        <li key={order.id}
                                                            className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                                            <p><strong>Code :</strong> {order.formattedOrderId || '-'}</p>
                                                            <p><strong>Modèle:</strong> {order.model || '-'}</p>
                                                            <p><strong>Carat:</strong> {order.carat || '-'}</p>
                                                            <p><strong>Poids:</strong> {<>{order.weight}g</> || '-'}</p>
                                                            <p><strong>Prix:</strong> {<>{order.price} dt</> || '-'}</p>
                                                            <p><strong>Avance:</strong> {<>{order.advance} dt</> || '-'}</p>
                                                            <p><strong>État:</strong> <span
                                                                className={order.status ? "text-green-600" : "text-red-600"}> {order.status ? "Disponible" : "Non disponible"}</span>
                                                            </p>
                                                            <p><strong>Date:</strong> {formatDate(order.createdAt) || '-'}</p>
                                                            {order.image &&       <p><strong>Image:</strong>        <button
                                                                type="button"
                                                                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800
                                                                    font-medium rounded-lg
                                                                    text-sm px-3 py-0.5 text-center me-2"
                                                                onClick={() => {
                                                                    setModalImageIsOpen(true);
                                                                    setImageUrl(order.image);
                                                                }}>

                                                                voir l'image
                                                            </button></p>                    }
                                                        </li>
                                                    ))}
                                            </ul> :
                                            <div className="p-1.5  inline-block align-middle">
                                                <h1 className="font-light leading-none tracking-tight mt-4 text-gray-900 text-2xl border-b-2 pb-2 mb-2">
                                                    Montant total:{" "}
                                                    <span className="border-blue-800 font-medium pr-1 pl-1 text-blue-700">
                {client.orders
                    .flatMap((order) => order.OrderHistory) // Flatten OrderHistory arrays
                    .reduce((total, history) => {
                        // Convert amount to a number and add to the total
                        const amount = parseFloat(history.amount.replace(" Dt", "")); // Remove " Dt" and convert to number
                        return total + (isNaN(amount) ? 0 : amount); // Handle invalid numbers
                    }, 0)}
            </span>
                                                </h1>
                                                <div className="overflow-hidden flex space-y-2 border rounded-2xl border-gray-200 p-2 ">
                                                    <table className=" overflow-scroll divide-y divide-gray-200">
                                                        <thead>
                                                        <tr>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Code
                                                            </th>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Montant
                                                            </th>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                        {client.orders
                                                            .flatMap((order) =>
                                                                order.OrderHistory.map((history) => ({
                                                                    ...history,
                                                                    formattedOrderId: order.formattedOrderId, // Include order ID for reference
                                                                }))
                                                            )
                                                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp
                                                            .map((history, index) => (
                                                                <tr key={index}>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                        {history.formattedOrderId}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                        {history.amount}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                                                                        {formatDate(history.timestamp)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>}


                                    </>
                                ) : (
                                    <p className="text-gray-500">Aucune commande trouvée.</p>
                                )}
                            </div>
                        )}

                        {selectedSection === "economies" && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">Économies</h3>
                                <div className="flex space-x-4 mb-6">
                                    <button
                                        className={`px-4 py-2 rounded-lg font-semibold ${selectedSectionSaving === "Ma7lol" ? "bg-black text-white" : "bg-gray-200"}`}
                                        onClick={() => setSelectedSectionSaving("Ma7lol")}
                                    >
                                        Ma7lol
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-lg font-semibold ${selectedSectionSaving === "Historique" ? "bg-black text-white" : "bg-gray-200"}`}
                                        onClick={() => setSelectedSectionSaving("Historique")}
                                    >
                                        Historique
                                    </button>
                                </div>

                                {client.savings && client.savings.length > 0 ? (
                                    <>
                                        {selectedSectionSaving === "Ma7lol" ?
                                            <div className="space-y-2 border rounded-2xl border-gray-200">
                                                <TableClientSaving data={client.savings}/>
                                            </div>:
                                            <div className="p-1.5  inline-block align-middle">
                                                <h1 className="font-light leading-none tracking-tight mt-4 text-gray-900 text-2xl border-b-2 pb-2 mb-2">
                                                    Montant total:{" "}
                                                    <span className="border-blue-800 font-medium pr-1 pl-1 text-blue-700">
                {client.savings
                    .flatMap((saving) => saving.SavingHistory) // Flatten OrderHistory arrays
                    .reduce((total, history) => {
                        // Convert amount to a number and add to the total
                        const amount = parseFloat(history.details.replace(" Dt", "")); // Remove " Dt" and convert to number
                        return total + (isNaN(amount) ? 0 : amount); // Handle invalid numbers
                    }, 0)}
            </span>
                                                </h1>
                                                <div className="overflow-hidden flex space-y-2 border rounded-2xl border-gray-200 p-2 ">
                                                    <table className=" overflow-scroll divide-y divide-gray-200">
                                                        <thead>
                                                        <tr>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Code
                                                            </th>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Montant
                                                            </th>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                        {client.savings
                                                            .flatMap((saving) =>
                                                                saving.SavingHistory.map((history) => ({
                                                                    ...history,
                                                                    UserSavingSequence: saving.UserSavingSequence, // Include order ID for reference
                                                                }))
                                                            )
                                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by timestamp
                                                            .map((history, index) => (
                                                                <tr key={index}>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                        {history.UserSavingSequence}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                        {history.details}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                                                                        {formatDate(history.createdAt)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        }
                                    </>

                                ) : (
                                    <p className="text-gray-500">Aucune économie trouvée.</p>
                                )}
                            </div>
                        )}

                        {selectedSection === "garanties" && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">Garanties</h3>
                                <div className="flex space-x-4 mb-6">
                                    <button
                                        className={`px-4 py-2 rounded-lg font-semibold ${selectedSectionGuarantee === "Facilité" ? "bg-black text-white" : "bg-gray-200"}`}
                                        onClick={() => setSelectedSectionGuarantee("Facilité")}
                                    >
                                        Facilité
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-lg font-semibold ${selectedSectionGuarantee === "Historique" ? "bg-black text-white" : "bg-gray-200"}`}
                                        onClick={() => setSelectedSectionGuarantee("Historique")}
                                    >
                                        Historique
                                    </button>
                                </div>


                                {client.guarantee && client.guarantee.length > 0 ? (
                                    <>
                                        {selectedSectionGuarantee === "Facilité" ?
                                            <div className="space-y-2 border rounded-2xl border-gray-200 p-2">
                                                <TableClientGuarantee data={client.guarantee}/>
                                            </div>:
                                            <div className="p-1.5  inline-block align-middle">
                                                <h1 className="font-light leading-none tracking-tight mt-4 text-gray-900 text-2xl border-b-2 pb-2 mb-2">
                                                    Montant total:{" "}
                                                    <span className="border-blue-800 font-medium pr-1 pl-1 text-blue-700">
                {client.guarantee
                    .flatMap((guarantee) => guarantee.GuaranteeHistory) // Flatten OrderHistory arrays
                    .reduce((total, history) => {
                        // Convert amount to a number and add to the total
                        const amount = parseFloat(history.amount.replace(" Dt", "")); // Remove " Dt" and convert to number
                        return total + (isNaN(amount) ? 0 : amount); // Handle invalid numbers
                    }, 0)}
            </span>
                                                </h1>
                                                <div className="overflow-hidden flex space-y-2 border rounded-2xl border-gray-200 p-2 ">
                                                    <table className=" overflow-scroll divide-y divide-gray-200">
                                                        <thead>
                                                        <tr>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Code
                                                            </th>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Montant
                                                            </th>
                                                            <th scope="col"
                                                                className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                        {client.guarantee
                                                            .flatMap((guarantee) =>
                                                                guarantee.GuaranteeHistory.map((history) => ({
                                                                    ...history,
                                                                    formattedGuaranteeId: guarantee.formattedGuaranteeId, // Include order ID for reference
                                                                }))
                                                            )
                                                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp
                                                            .map((history, index) => (
                                                                <tr key={index}>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                        {history.formattedGuaranteeId}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                        {history.amount}
                                                                    </td>
                                                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">
                                                                        {formatDate(history.timestamp)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        }
                                    </>

                                ) : (
                                    <p className="text-gray-500">Aucune garantie trouvée.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        <ImageOrderModal open={modalImageIsOpen} onClose={handleCloseModal} url={imageUrl}/>
            <Modal open={modalUpdateIsOpen} onClose={handleStopUpdate}>
                <div className="relative bg-white rounded-lg shadow">
                    <button
                        type="button"
                        onClick={handleStopUpdate}
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
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>
                        <h3 className="mb-5 text-lg font-normal text-gray-500">
                            Voulez-vous vraiment modifier le client?
                        </h3>

                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="name" className="text-lg font-normal text-start mr-3 text-gray-500 pr-2 w-24">
                                Nom:
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={updatedName || ""}
                                placeholder="Nom et prénom ..."
                                onChange={(e) => setUpdatedName(e.target.value)}
                                className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                            />
                        </div>

                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="phone" className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                                Téléphone:
                            </label>
                            <input
                                type="text"
                                id="phone"
                                value={updatedPhone || ""}
                                placeholder="Numéro de téléphone ..."
                                onChange={(e) => setUpdatedPhone(e.target.value)}
                                className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                            />
                        </div>

                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="location" className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                                Emplacement:
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={updatedLocation || ""}
                                placeholder="Emplacement ..."
                                onChange={(e) => setUpdatedLocation(e.target.value)}
                                className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                            />
                        </div>

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 min-w-20 rounded w-full outline-none focus-within:border-blue-700 focus:ring-blue-500"
                        />

                        {confirmError && (
                            <div className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 mb-2 p-1 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-center">{confirmError}</p>
                            </div>
                        )}

                        <button
                            data-modal-hide="popup-modal"
                            type="submit"
                            onClick={() => handleUpdate()}
                            disabled={loading}
                            className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={handleStopUpdate}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >
                            No, Annuler
                        </button>
                    </div>
                </div>
            </Modal>
    </>

    );
}

export default Detail;