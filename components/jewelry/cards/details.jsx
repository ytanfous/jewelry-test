"use client";
import React, {useEffect, useState} from 'react';
import Image from "next/image";
import ListProducts from "@/components/jewelry/cards/listProducts";
import ProductModal from "@/components/jewelry/cards/ProductModal";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import ListHistory from "@/components/jewelry/cards/ListHistory";
import Modal from "@/components/bids/UI/Modal";
import {TbEdit} from "react-icons/tb";
import Link from "next/link";
import ReceiveProductModal from "@/components/jewelry/cards/ReceiveProductModal";
import Loading from "@/app/loading";
import {IoPersonRemoveOutline} from "react-icons/io5";
import JewelerRemoveModal from "@/components/jewelry/cards/JewelerRemoveModal";

function Details({id}) {
    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [formData, setFormData] = useState(null);
    const [state, setState] = useState("Product");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalIsOpenEdit, setModalIsOpenEdit] = useState(false);
    const [modalIsOpenReceive, setModalIsOpenReceive] = useState(false);
    const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
    const {data: session} = useSession();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [editedName, setEditedName] = useState('');
    const [editedContact, setEditedContact] = useState('');
    const [editedStoreName, setEditedStoreName] = useState('');
    const [editedImage, setEditedImage] = useState(null);
    const [formErrors, setFormErrors] = useState('');
    const searchParams = useSearchParams();
    const states = searchParams.get('state');

    useEffect(() => {
        setState(states === 'history' ? 'History' : 'Product');
    }, [states]);
    function handleStateUpdate() {
        if (state === "Product") {
            setState('History')
        } else {
            setState('Product')
        }
    }

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/jewelers/${id}`);

                if (response.ok) {
                    const data = await response.json();
                    if (session.user.id !== data.userId) {
                        router.push('/jewelry');
                        return;
                    }
                    setFormData({...data});
                    setEditedName(data.name);
                    setEditedContact(data.phone);
                    setEditedStoreName(data.storeName);
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
    }, [id, session, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if (!/^\d{8}$/.test(editedContact)) {
        //     setFormErrors('Le numéro de téléphone doit comporter 8 chiffres');
        //     return;
        // }
        // setFormErrors('');
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
            const response = await fetch(`/api/jewelers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    imageUpdate: editedImage  ,
                    name: editedName,
                    phone: editedContact,
                    storeName: editedStoreName
                }),
            });

            if (response.ok) {
                setPassword(null);
                setModalIsOpen(false);
                setModalIsOpenEdit(false);

                window.location.reload();
            } else {
                console.error('Failed to update supplier');
                setConfirmError('Mauvais mot de passe');
                setLoadingSubmit(false);
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
            setConfirmError(error.message);
            setLoadingSubmit(false);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (name === 'name') {
            setEditedName(value);
        } else if (name === 'contact') {
            setEditedContact(value);
        }else if (name === 'storeName') {
            setEditedStoreName(value);
        }
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataURL = reader.result;
                const newImage = {
                    size: file.size,
                    type: file.type,
                    name: file.name,
                    lastModified: file.lastModified,
                    dataURL: dataURL
                };
                setEditedImage(newImage);

            };
            reader.readAsDataURL(file);

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
        return <Loading/>;
    }

    const formattedPhone = formData.phone ? formData.phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1-$2-$3") : '';
    const imageSrc = formData.image || '/image/profil.png';
    const handleOpenModal = () => {
        setModalIsOpen(true);
        setConfirmError('');
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setModalIsOpenEdit(false);
        setModalIsOpenReceive(false);
        setModalIsOpenRemove(false);
        setConfirmError('');
    };
    const handleOpenModalEdit = () => {
        setModalIsOpenEdit(true);
        setConfirmError('');
    };
    const handleOpenModalRemove = () => {
        setModalIsOpenRemove(true);
        setConfirmError('');
    };

    const handleOpenModalReceive = () => {
        setModalIsOpenReceive(true);
        setConfirmError('');
    };

    return (
        <div className="max-w-7xl  w-full mx-auto z-10">
            <div className="flex flex-col flex-wrap items-center">
                <div className="bg-white border border-white shadow-lg rounded-xl p-4 w-full">
                    <div className="flex-none sm:flex">
                        <div className="relative h-32 w-32 sm:mb-0 mb-3">
                            <Image
                                src={imageSrc}
                                alt=""
                                fill
                                className="w-32 h-32 object-cover rounded-2xl bg-gray-200 flex items-center justify-center"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                        </div>
                        <div className="flex-auto sm:ml-5 justify-evenly ">
                            <div
                                className="flex items-center flex-wrap justify-between sm:mt-2 border-b border-gray-200 pb-2">
                                <div className="flex justify-start items-center">

                                    <div className="flex flex-col">
                                        <div className="w-full flex-none text-lg text-gray-800 font-bold leading-none">
                                            {formData.name}
                                        </div>
                                        <div className="flex-auto text-gray-500 my-1 ">
                                            <span className="mr-3"><span
                                                className="font-semibold">Boutique :</span> {formData.storeName}</span>
                                        </div>
                                        {/*<div className="flex-auto text-gray-500  ">*/}
                                        {/*    <span className="mr-3"><span className="font-semibold">Numéro de téléphone :</span> {formattedPhone}</span>*/}
                                        {/*</div>*/}
                                    </div>
                                    <button type="button" onClick={handleOpenModalEdit}
                                            className=" text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 ml-2
                        focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 ">
                                        <TbEdit/>
                                    </button>
                                    <button type="button" onClick={handleOpenModalRemove}
                                            className=" text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 ml-2
                        focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 ">
                                        <IoPersonRemoveOutline />
                                    </button>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        className={`px-5 py-2 font-medium tracking-wider ${
                                            state === 'Product'
                                                ? 'text-white bg-gray-900 hover:bg-gray-700'
                                                : ' bg-yellow-400 hover:bg-yellow-300'
                                        } rounded-xl  mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm`}
                                        onClick={handleStateUpdate}
                                    >
                                        {state === 'Product' ? <>Voir l'historique</> : <>Voir les produits</>}
                                    </button>
                                    <Link href={`/jewelry/Slaf/${id}`}
                                          className="px-5 py-2 font-medium tracking-wider text-white rounded-xl bg-gray-900 hover:bg-gray-700 focus:ring-4 mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm"
                                    >
                                        Slaf
                                    </Link>
                                    <Link href={`/jewelry/Weslet/${id}`}
                                          className="px-5 py-2 font-medium tracking-wider text-white rounded-xl bg-gray-900 hover:bg-gray-700 focus:ring-4 mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm"
                                    >
                                        Weslet
                                    </Link>
                                    <button
                                        className="px-5 py-2 font-medium tracking-wider text-white rounded-xl bg-gray-900 hover:bg-gray-700 focus:ring-4 mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm"
                                        onClick={handleOpenModalReceive}
                                    >
                                        Récupérer
                                    </button>
                                    <button
                                        className="px-5 py-2 font-medium tracking-wider text-white rounded-xl bg-gray-900 hover:bg-gray-700 focus:ring-4 mb-2 inline-flex items-center justify-center whitespace-nowrap focus:outline-none text-sm"
                                        onClick={handleOpenModal}
                                    >
                                        Ajouter des produits
                                    </button>

                                </div>
                            </div>
                            {state === 'Product' && <div className="flex pt-2 text-sm text-gray-500">
                                <ListProducts id={id} session={session}/>
                            </div>}
                            {state === 'History' && <div className="flex pt-2 text-sm text-gray-500">
                                <ListHistory id={id} session={session}/>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
            <ReceiveProductModal open={modalIsOpenReceive} onClose={handleCloseModal} session={session} id={id}/>
            <ProductModal open={modalIsOpen} onClose={handleCloseModal} session={session} id={id}/>
            <JewelerRemoveModal open={modalIsOpenRemove} onClose={handleCloseModal} session={session} id={id}/>
            <Modal open={modalIsOpenEdit} onClose={() => {
                setModalIsOpenEdit(false);
                setPassword(null);
            }}>
                <div className="relative bg-white rounded-lg shadow ">
                    <button
                        type="button"
                        onClick={() => {
                            setModalIsOpenEdit(false);
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
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500">Êtes-vous sûr ?</h1>
                        <h3 className="mb-5 text-lg font-normal text-gray-500">Êtes-vous sûr de vouloir modifier ce
                            bijoutier
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
                            <label htmlFor="storeName" className="text-lg font-normal text-gray-500 pr-2 w-24">
                                Boutique :
                            </label>
                            <input
                                type="text"
                                id="storeName"
                                name="storeName"
                                value={editedStoreName}
                                onChange={handleInputChange}
                                className="p-2 border-2 rounded flex-1 outline-none focus-within:border-blue-700 focus:ring-blue-500"
                            />
                        </div>
                        {/*<div className="mb-4 flex items-center justify-start">
                            <label htmlFor="contact" className="text-lg font-normal text-gray-500 pr-2 w-24">
                                Téléphone:
                            </label>
                            <input
                                type="text"
                                id="contact"
                                name="contact"
                                maxLength={8}
                                value={editedContact}
                                onChange={handleInputChange}
                                className="p-2 border-2 rounded flex-1 outline-none focus-within:border-blue-700 focus:ring-blue-500"
                            />
                        </div>
                        {formErrors && (
                            <div className="mt-4 bg-red-400 rounded-xl  mb-2 text-gray-700 p-2 flex flex-nowrap gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                     fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p>{formErrors}</p>
                            </div>
                        )}*/}
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="image" className="text-lg font-normal text-gray-500 pr-2 w-24">Image
                                :</label>
                            <input

                                type="file" name="image" id="image" accept="image/png, image/jpeg"
                                onChange={handleImageChange}
                                className="p-2 border-2 rounded flex-1 outline-none focus-within:border-blue-700 focus:ring-blue-500"
                            />

                        </div>


                        {formErrors && (
                            <div className="mt-4 bg-red-400 rounded-xl mb-2 text-gray-700 p-2 flex flex-nowrap gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p>{formErrors}</p>
                            </div>
                        )}
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
                            disabled={loadingSubmit}
                            className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none disabled:bg-gray-200 focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            onClick={() => {
                                setModalIsOpenEdit(false);
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
