"use client"
import React, {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

import ListOrders from "@/components/jewelry/suppliers/ListOrders";
import SupplierOrderHistory from "@/components/jewelry/suppliers/ListOrdersHistory";
import Link from "next/link";
import {TbEdit} from "react-icons/tb";
import {ImPrinter} from "react-icons/im";
import Modal from "@/components/bids/UI/Modal";

function Details({id}) {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(null);
    const [state, setState] = useState("Orders");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const {data: session} = useSession();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [editedName, setEditedName] = useState('');
    const [editedContact, setEditedContact] = useState('');
    const [editedNote, setEditedNote] = useState('');
    const [editedAdvance, setEditedAdvance] = useState('');
    const [editedPrice, setEditedPrice] = useState('');
    const [isloading, setIsloading] = useState(false);

    function handleStateUpdate() {
        if (state === "Orders") {
            setState('History')
        } else {
            setState('Orders')
        }
    }

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/suppliers/${id}`);

                if (response.ok) {
                    const data = await response.json();
                    if (session.user.id !== data.userId) {
                        router.push('/jewelry/order/listOrdersSuppliers');
                        return;
                    }

                    setFormData({...data});
                    setEditedName(data.name);
                    setEditedContact(data.contact);
                    setEditedNote(data.note);
                    setEditedAdvance(data.advance);
                    setEditedPrice(data.price);
                } else {
                    console.error('Failed to fetch supplier data');
                }
            } catch (error) {
                console.error('Error fetching supplier data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id, session, router]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (name === 'name') {
            setEditedName(value);
        } else if (name === 'contact') {
            setEditedContact(value);
        }else if (name === 'price') {
            setEditedPrice(value);
        }else if (name === 'advance') {
            setEditedAdvance(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsloading(true);
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
                setIsloading(false);
                throw new Error('Mot de passe incorrect');
            }

            const response = await fetch(`/api/suppliers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedName,
                    contact: editedContact,
                    note: editedNote,
                    advance: editedAdvance,
                    price: editedPrice,
                }),
            });

            if (response.ok) {
                setPassword(null);
                setModalIsOpen(false);
                window.location.reload();
            } else {
                setIsloading(false);
                console.error('Failed to update supplier');
                setConfirmError('Mauvais mot de passe');
            }
        } catch (error) {
            setIsloading(false);
            console.error('Error updating supplier:', error);
            setConfirmError(error.message);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen border border-gray-200 rounded-lg ">
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

    if (!formData) {
        return <div>Error: No data found</div>;
    }


    function handleOpenModal() {
        setModalIsOpen(true);
        setPassword(null);
        setConfirmError(null);
    }

    return (
        <div className="max-w-4xl  w-full mx-auto z-10">
            <div className="flex flex-col flex-wrap items-center">
                <div className="bg-white border border-white shadow-lg rounded-3xl p-4 m-4 w-full">
                    <div className="flex-none sm:flex">
                        <div className="flex-auto sm:ml-5 justify-evenly ">

                            <div
                                className="flex items-center flex-wrap justify-between sm:mt-2  border-b border-gray-200 pb-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col mb-2">
                                        <div className="w-full flex-none text-lg text-gray-800 font-bold leading-none">
                                            {formData.name}
                                        </div>
                                        <div className="flex-auto text-gray-500 my-1 ">
                                            <span className="mr-3">Contact : {formData.contact}</span>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleOpenModal} disabled={isloading}
                                            className=" text-blue-700 hover:text-white border disabled:bg-blue-300 border-blue-700 hover:bg-blue-800 focus:ring-4 ml-2
                        focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 ">
                                        <TbEdit/>
                                    </button>

                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        className="px-4 py-2 font-medium tracking-wider text-white rounded-full bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:ring-orange-300  mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm"
                                        onClick={handleStateUpdate}
                                    >
                                        {state === 'Orders' ? <>Voir l'historique</> : <>Voir les Commandes</>}
                                    </button>
                                    <Link href="/jewelry/order/addOrderSupplier"
                                          className="px-5 py-2 font-medium tracking-wider text-white rounded-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 me-2 mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm"
                                    >
                                        Ajouter une Commande
                                    </Link>
                                </div>


                            </div>
                            {state === 'Orders' && <div className="flex pt-2 text-sm text-gray-500">
                                <ListOrders id={id} session={session}/>
                            </div>}
                            {state === 'History' && <div className="flex pt-2 text-sm text-gray-500">
                                <SupplierOrderHistory id={id} session={session}/>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
            <Modal open={modalIsOpen} onClose={() => {
                setModalIsOpen(false);
                setPassword(null);
            }}>
                <div className="relative bg-white rounded-lg shadow ">
                    <button
                        type="button"
                        onClick={() => {
                            setModalIsOpen(false);
                            setPassword(null);
                        }}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
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
                        <h3 className="mb-5 text-lg font-normal text-gray-500">Êtes-vous sûr de vouloir modifier ce
                            fournisseur
                            ?</h3>

                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="name" className="text-lg font-normal text-gray-500 pr-2 w-24">
                                Nom :
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={editedName}
                                onChange={handleInputChange}
                                className="p-2 border-2 rounded flex-1 outline-none focus-within:border-blue-700 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="contact" className="text-lg font-normal text-gray-500 pr-2 w-24">
                                Contact :
                            </label>
                            <input
                                type="text"
                                id="contact"
                                name="contact"
                                value={editedContact}
                                onChange={handleInputChange}
                                className="p-2 border-2 rounded flex-1 outline-none focus-within:border-blue-700 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="contact" className="text-lg font-normal text-gray-500 pr-2 w-24">
                                Prix :
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={editedPrice}
                                onChange={handleInputChange}
                                className="p-2 border-2 rounded flex-1 outline-none focus-within:border-blue-700 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="contact" className="text-lg font-normal text-gray-500 pr-2 w-24">
                                Avance :
                            </label>
                            <input
                                type="text"
                                id="advance"
                                name="advance"
                                value={editedAdvance}
                                onChange={handleInputChange}
                                className="p-2 border-2 rounded flex-1 outline-none focus-within:border-blue-700 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="note"
                                   className="text-lg font-normal text-gray-500 pr-2 w-24">Note</label>
                            <textarea
                                id="note"
                                rows="5"
                                value={editedNote}
                                onChange={(e) => setEditedNote(e.target.value)}
                                className="block p-2.5 w-full  mb-5  outline-none  rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500  focus:border-2 resize-none"

                            />
                        </div>

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
                            disabled={isloading}
                            className="text-white focus:ring-4 bg-blue-500  disabled:bg-blue-300 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={() => {
                                setModalIsOpen(false);
                                setPassword(null);
                            }}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-blue-100 hover:bg-blue-200 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >
                            Non, annuler
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Details;