"use client"
import React, {useEffect, useState} from 'react';
import Modal from "@/components/bids/UI/Modal";
import {useSession} from "next-auth/react";

function Formulaire() {
    const {data: session} = useSession();
    const [loadingText, setLoadingText] = useState('Chargement ');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        storeName: '',
        image: null,
        userId: null
    });
    const [formErrors, setFormErrors] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [submit, setSubmit] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (session && session.user) {
            setFormData((prevData) => ({
                ...prevData,
                userId: session.user.id
            }));
        }
    }, [session]);
    useEffect(() => {
        if (submit) {
            const interval = setInterval(() => {
                setLoadingText((prev) => {
                    if (prev.endsWith('...')) {
                        return 'Chargement ';
                    } else {
                        return prev + '.';
                    }
                });
            }, 500); // Update every 500ms
            return () => clearInterval(interval); // Cleanup the interval on unmount
        }
    }, [submit]);
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataURL = reader.result;
                setFormData((prevData) => ({
                    ...prevData,
                    image: {
                        type: file.type, // MIME type
                        dataURL: dataURL, // Base64 encoded string
                    },
                }));
            };
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };


    const handleRemoveFile = () => {
        setFormData((prevData) => ({
            ...prevData,
            image: null,
        }));
        setSelectedFile(null);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files[0];
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
                setFormData((prevData) => ({
                    ...prevData,
                    image: newImage,
                }));
            };
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };

    const handleChange = (event) => {
        const {name, value} = event.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 8) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: numericValue,
                }));
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formErrors = {};

        if (!formData.name.trim()) {
            formErrors.name = 'Le nom est requis';
        }

        // if (!/^\d{8}$/.test(formData.phone)) {
        //     formErrors.phone = 'Le numéro de téléphone doit comporter 8 chiffres';
        // }

        // if (!formData.image) {
        //     formErrors.image = 'L\'image est requise';
        // }

        setFormErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            setModalIsOpen(true);
        }
    };

    const handleModalSubmit = async () => {
        try {
            setSubmit(true);

            const response = await fetch('/api/jewelers/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        } catch (error) {
            setSubmit(false);

            console.error(error);
        }
    };

    return (
        <>
            <div className="flex items-center justify-center ">
                <div className="mx-auto w-full max-w-[550px] bg-white mt-4 border border-white shadow-lg rounded-3xl">
                    <form className="py-4 px-9" onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label htmlFor="name" className="mb-3 block text-base font-medium text-[#07074D]">
                                Nom et Prénom :
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="example"
                                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {formErrors.name && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.name}</p>
                                </div>
                            )}
                        </div>
                        <div className="mb-5">
                            <label htmlFor="storeName" className="mb-3 block text-base font-medium text-[#07074D]">
                                Nom de la boutique :
                            </label>
                            <input
                                type="text"
                                name="storeName"
                                id="storeName"
                                placeholder="example"
                                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                value={formData.storeName}
                                onChange={handleChange}
                            />
                            {formErrors.storeName && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.storeName}</p>
                                </div>
                            )}
                        </div>
                   {/*     <div className="mb-5">
                            <label htmlFor="phone" className="mb-3 block text-base font-medium text-[#07074D]">
                                Numéro de téléphone :
                            </label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                placeholder="12345678"
                                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={8}
                            />
                            {formErrors.phone && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.phone}</p>
                                </div>
                            )}
                        </div>*/}
                        <div className="mb-6 ">
                            <label className="mb-3 block text-base font-medium text-[#07074D]">Télécharger une
                                image</label>
                            <div
                                className={`relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center ${dragActive ? 'border-blue-500' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input type="file" name="file" id="file" accept="image/png, image/jpeg"
                                       className="sr-only" onChange={handleFileChange}/>
                                <label htmlFor="file"
                                       className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                    <div>
                                        <span className="mb-2 block text-xl font-semibold text-[#07074D]">Déposez l'image ici</span>
                                        <span className="mb-2 block text-base font-medium text-[#6B7280]">Ou</span>
                                        <span
                                            className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D]">Parcourir</span>
                                    </div>
                                </label>
                            </div>
                            {formErrors.image && (
                                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p>{formErrors.image}</p>
                                </div>
                            )}
                            {selectedFile && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-left">
                                        <p className="text-gray-700">{selectedFile.name}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <button type="button" onClick={handleRemoveFile}
                                                className="text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                                 viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <button type="submit"
                                    className="hover:shadow-form rounded-md bg-blue-700 hover:bg-blue-800 w-full py-3 px-8 text-base font-semibold text-white outline-none">
                                Valider
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={() => setModalIsOpen(false)}
                            className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900
                             rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                            data-modal-hide="popup-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500"> Es-tu sûr ?</h1>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment ajouter ce
                            bijoutier ?</h3>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleModalSubmit} disabled={submit}
                                className="text-white focus:ring-4 bg-blue-500 disabled:bg-gray-500 disabled:cursor-none focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                            {submit ? loadingText : 'Oui, je suis sûr'}
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={() => setModalIsOpen(false)}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg hover:bg-blue-200 bg-blue-100 focus:z-10 focus:ring-4 focus:ring-gray-100">No,
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default Formulaire;
