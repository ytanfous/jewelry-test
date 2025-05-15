import React, {useState} from 'react';
import TicketHeader from "@/components/admin/home/ticketHeader";
import {FaUsers} from "react-icons/fa";
import {BsCart2} from "react-icons/bs";
import {BiWorld} from "react-icons/bi";
import {RiAuctionLine} from "react-icons/ri";
import {GrTransaction} from "react-icons/gr";
import {TEChart} from "tw-elements-react";
import Link from "next/link";
import {useSession} from "next-auth/react";
import Modal from "@/components/bids/UI/Modal";
import TableHistory from "@/components/admin/home/TableHistory";
import {useFeatures} from "@/app/hooks/featuresApi";
import Loading from "@/app/loading";

const Details = ({userProfile}) => {
    const {data: session} = useSession();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const {types, provenance, carat, loading} = useFeatures();
    const [formData, setFormData] = useState({
        password: '123456',
        confirmPassword: '123456',
    });
    const [confirmError, setConfirmError] = useState('');
    if (!userProfile) {
        return <div>No user profile available</div>;
    }

    const {
        id,
        username,
        name,
        CompanyName,
        email,
        location,
        phone,
        auctions,
        products,
        type,
        createdAt,
        ConnectionHistory,
        TransactionHistory
    } = userProfile;
    const [typeSelect, setTypeSelect] = useState(type);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} à ${hours}:${minutes}`;
    };

    const formatDateGraph = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    // Utility function to group items by date
    const groupByDate = (items) => {
        return items.reduce((acc, item) => {
            const date = formatDateGraph(item.createdAt);
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
    };

    const handleChange = (e) => {
        const selectedType = e.target.value;
        setTypeSelect(selectedType);
    };

    const modelOpen = () => {
        setModalIsOpen(true);
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/user/userUpdateType`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, type: typeSelect}),
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };


    const productsByDate = groupByDate(products);
    const auctionsByDate = groupByDate(auctions);

    const labels = Array.from(new Set([...Object.keys(productsByDate), ...Object.keys(auctionsByDate)])).sort();

    // Prepare the dataset for the chart
    const productCounts = labels.map(date => productsByDate[date] || 0);
    const auctionCounts = labels.map(date => auctionsByDate[date] || 0);
    const handleModalSubmit = async (e) => {
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


            const response = await fetch('/api/register/updateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: id,
                    ...formData,
                }),
            });
            const data = await response.json();
            setModalIsOpen(false);


            if (data.redirect) {
                if (data.redirect === '/') {
                    window.location.reload();
                }
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            setConfirmError('Erreur lors de la mise à jour');
        }
    };

    if (!Array.isArray(types)) {
        return <Loading/>; // Handle undefined or incorrect types structure
    }


    const labelsTypes = Array.from(new Set(types.map(t => t.name))).sort();
    const typesCounts = labelsTypes.map(typeName => {
        return products.filter(product => product.model === typeName).length;
    });
    if (!Array.isArray(carat)) {
        return <Loading/>; // Handle undefined or incorrect types structure
    }


    const labelsCarat = Array.from(new Set(carat.map(t => t.value))).sort();
    const caratCounts = labelsCarat.map(typeName => {
        return products.filter(product => product.carat === typeName).length;
    });

    if (!Array.isArray(provenance)) {
        return <Loading/>; // Handle undefined or incorrect types structure
    }


    const labelsOrigin = Array.from(new Set(provenance.map(t => t.name))).sort();
    const originCounts = labelsOrigin.map(typeName => {
        return products.filter(product => product.origin === typeName).length;
    });
    return (<>
            <div className="flex justify-between flex-wrap flex-col  ">

                <h1 className=" mb-4 text-2xl font-light  leading-none    text-gray-900  ">Détails du profil
                    utilisateur</h1>


                <div className="flex flex-wrap -mx-3">
                    <TicketHeader icon={BsCart2} productName="Produits" quantity={products?.length || 0}/>
                    <TicketHeader icon={GrTransaction} productName="Transaction"
                                  quantity={TransactionHistory?.length || 0}/>
                    <TicketHeader icon={BiWorld} productName="Connectés"
                                  quantity={ConnectionHistory?.length || 0}/>
                    <TicketHeader icon={RiAuctionLine} productName="Enchères" quantity={auctions?.length || 0}/>

                </div>
            </div>
            <div className="flex flex-wrap mt-5 -mx-3">
                <div className="w-full max-w-full px-3 mb-6  sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
                    <div
                        className="relative flex flex-col p-3 min-w-0 break-words gap-2 shadow-md rounded-2xl bg-clip-border  transition-transform duration-300 ease-in-out  bg-white">
                        <h3 className="font-semibold mb-4 text-2xl">Informations utilisateur</h3>
                        <p><strong>Nom d'utilisateur :</strong> {name}</p>
                        <p><strong>Pseudo:</strong> {username}</p>
                        <p><strong>Numéro de téléphone:</strong> {phone}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Nom de l'entreprise:</strong> {CompanyName}</p>
                        <p><strong>Emplacement:</strong> {location}</p>
                        <p><strong>Date de création:</strong> {formatDate(createdAt)}</p>
                    </div>
                    <div
                        className="relative flex flex-col mt-4 p-3 gap-4 min-w-0 break-words  shadow-md rounded-2xl bg-clip-border  transition-transform duration-300 ease-in-out  bg-white">
                        <h3 className="text-lg font-semibold">Mettre à jour le type de l'utilisateur</h3>
                        <div>
                            <select
                                id="userType"
                                value={typeSelect}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm outline-blue-700 outline-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            >
                                <option value="user">user</option>
                                <option value="user-auction">user-auction</option>
                            </select>
                        </div>
                        <button onClick={handleSubmit} type="submit"
                                className="rounded-xl bg-gradient-to-br from-blue-600 to-pink-300 px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-blueSecondary/50">
                            Mettre à jour le type
                        </button>
                    </div>
                    <div
                        className="relative flex flex-col mt-4 p-3 gap-4 min-w-0 break-words  shadow-md rounded-2xl bg-clip-border  transition-transform duration-300 ease-in-out  bg-white">
                        <h3 className="text-lg font-semibold">Mettre à jour le mot de passe de l'utilisateur</h3>

                        <button onClick={modelOpen} type="submit"
                                className="rounded-xl bg-gradient-to-br from-blue-600 to-pink-300 px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-blueSecondary/50">
                            Réinitialiser
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-full px-3 mb-6  sm:w-1/2 sm:flex-none xl:mb-0 xl:w-3/4">
                    <div
                        className="relative flex flex-col p-3 min-w-0 break-words gap-1 shadow-md rounded-2xl bg-clip-border  transition-transform duration-300 ease-in-out  bg-white">
                        <TEChart
                            type="line"
                            data={{
                                labels: labels,
                                datasets: [
                                    {
                                        label: "Nombre de produits par jour",
                                        data: productCounts,
                                        borderColor: 'rgba(0, 255, 0, 1)',
                                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    },
                                    {
                                        label: "Nombre d'enchères par jour",
                                        data: auctionCounts,
                                        borderColor: 'rgba(0, 0, 255, 1)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                    },
                                ],
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap mt-5 -mx-3">
                <TableHistory id={id}/>
                <div className="w-full max-w-full sm:w-1/2 flex flex-wrap sm:flex-none xl:mb-0 xl:w-3/4">
                    <div className="w-full max-w-full px-3 mb-6  sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/3">
                        <div
                            className="relative flex flex-col p-3 min-w-0 break-words gap-1 shadow-md rounded-2xl bg-clip-border
                 transition-transform duration-300 ease-in-out  bg-white">
                            <TEChart
                                type="radar"
                                data={{
                                    labels: labelsTypes,
                                    datasets: [
                                        {
                                            label: "Produits",
                                            data: typesCounts,
                                        },
                                    ],
                                }}
                            />
                        </div>
                    </div>


                    <div className="w-full max-w-full px-3 mb-6  sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/3">
                        <div
                            className="relative flex flex-col p-3 min-w-0 break-words gap-1 shadow-md rounded-2xl bg-clip-border
                 transition-transform duration-300 ease-in-out  bg-white">
                            <TEChart
                                type="radar"
                                data={{
                                    labels: labelsCarat,
                                    datasets: [
                                        {
                                            label: "Produits",
                                            data: caratCounts,
                                            borderColor: 'rgba(0, 255, 0, 1)',
                                            backgroundColor: 'rgba(0,255,0,0.34)',
                                        },
                                    ],
                                }}
                            />
                        </div>
                    </div>
                    <div className="w-full max-w-full px-3 mb-6  sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/3">
                        <div
                            className="relative flex flex-col p-3 min-w-0 break-words gap-1 shadow-md rounded-2xl bg-clip-border
                 transition-transform duration-300 ease-in-out  bg-white">
                            <TEChart
                                type="radar"
                                data={{
                                    labels: labelsOrigin,
                                    datasets: [
                                        {
                                            label: "Produits",
                                            data: originCounts,
                                            borderColor: 'rgb(255,0,0)',
                                            backgroundColor: 'rgba(255,0,0,0.34)',
                                        },
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <div className="relative bg-white rounded-lg shadow">
                    <button
                        type="button"
                        onClick={() => setModalIsOpen(false)}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                        data-modal-hide="popup-modal"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>
                        <h3 className="mb-5 text-lg font-normal text-gray-500">Vous souhaitez vraiment Mettre à jour
                            le
                            mot de passe de {name} ?</h3>
                        <input
                            type="password"
                            placeholder="mot de passe avant la mise à jour .... "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 p-2 border-2 rounded w-full outline-none focus-within:border-blue-700 focus:ring-blue-500"
                        />
                        {confirmError && (
                            <div
                                className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 mb-2 p-1 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                     fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p className="text-center">{confirmError}</p>
                            </div>
                        )}
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={handleModalSubmit}
                            className="text-white focus:ring-4 bg-gradient-to-br from-blue-600 to-pink-300 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={() => setModalIsOpen(false)}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-blue-100 hover:bg-blue-200 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >
                            Non, annuler
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Details;
