'use client';

import React, {useEffect, useState} from 'react';
import {signOut, useSession} from 'next-auth/react';
import Modal from '@/components/bids/UI/Modal';

function UpdateUser() {
    const {data: session} = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
        location: '',
        CompanyName: '',
        name: '',
        email: '',
        phone: '',
    });
    const [formErrors, setFormErrors] = useState({email: null, password: null, phone: null});

    useEffect(() => {
        if (session && session.user) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`/api/register/getUser?userId=${session.user.id}`);
                    const userData = await response.json();
                    setFormData({
                        location: userData.location || '',
                        CompanyName: userData.CompanyName || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        name: userData.name || ''
                    });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchData();
        }
    }, [session]);

    function handleChange(event) {
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
    }

    async function handleSubmit() {
        const formErrors = {};

        if (formData.password?.length > 0) {
            if (formData.password !== formData.confirmPassword || formData.password.length < 6) {
                formErrors.password = 'Le mot de passe ne correspondent pas ou il est inférieur à 6 caractères';
            }
        }
        if (formData.phone?.length > 0) {
            if (!/^\d{8}$/.test(formData.phone)) {
                formErrors.phone = 'Le numéro de téléphone doit comporter 8 chiffres';
            }
        }

        if (formData.email?.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                formErrors.email = "L'adresse e-mail n'est pas valide";
            }
        }
        setFormErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            setModalIsOpen(true);
            setPassword('');
            setConfirmError('');
        }
    }

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

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
                    userId: session.user.id,
                    ...formData,
                }),
            });
            const data = await response.json();
            setModalIsOpen(false);


            if (data.redirect) {
                if (data.redirect === '/') {
                    await signOut({redirect: false});
                    window.location.href = data.redirect;
                }
                window.location.href = data.redirect;
            }else{
                setIsSubmitting(false);

            }
        } catch (error) {
            console.error(error);
            setConfirmError('Erreur lors de la mise à jour');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className="mx-auto w-full max-w-[550px] bg-white mt-4 border border-white shadow-lg rounded-3xl">
                <div className="flex flex-col p-4 mt-2">
                    <div className="mb-5">
                        <label htmlFor="name" className="mb-3 block text-base font-medium text-[#07074D]">
                            Nom et prenom:
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="nom et prenom"
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
                        <label htmlFor="location" className="mb-3 block text-base font-medium text-[#07074D]">
                            Emplacement :
                        </label>
                        <input
                            type="text"
                            name="location"
                            id="location"
                            placeholder="Exemple ..."
                            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="CompanyName" className="mb-3 block text-base font-medium text-[#07074D]">
                            Nom de l'entreprise:
                        </label>
                        <input
                            type="text"
                            name="CompanyName"
                            id="CompanyName"
                            placeholder="Exemple..."
                            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                            value={formData.CompanyName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="CompanyName" className="mb-3 block text-base font-medium text-[#07074D]">
                            Numéro de Téléphone:
                        </label>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            placeholder="Exemple..."
                            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {formErrors.phone && (
                            <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                     fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p>{formErrors.phone}</p>
                            </div>
                        )}
                    </div>
                    <div className="mb-5">
                        <label htmlFor="CompanyName" className="mb-3 block text-base font-medium text-[#07074D]">
                            Adresse e-mail:
                        </label>
                        <input
                            type="text"
                            name="email"
                            id="email"
                            placeholder="Exemple..."
                            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {formErrors.email && (
                            <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                     fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p>{formErrors.email}</p>
                            </div>
                        )}
                    </div>
                    <div className="mb-5">
                        <label htmlFor="password" className="mb-3 block text-base font-medium text-[#07074D]">
                            Nouveau mot de passe:
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="******"
                            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                            value={formData.password}
                            onChange={handleChange}
                        />

                    </div>
                    <div className="mb-5">
                        <label htmlFor="confirmPassword" className="mb-3 block text-base font-medium text-[#07074D]">
                            Confirmer mot de passe:
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            placeholder="******"
                            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {formErrors.password && (
                            <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                     fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p>{formErrors.password}</p>
                            </div>
                        )}
                    </div>
                    <button onClick={handleSubmit}
                            className="block w-full rounded-md bg-[#6A64F1] hover:bg-[#5b54e2] py-3 px-6 text-center text-base font-semibold text-white outline-none">
                        Mettre à jour
                    </button>
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
                        <h3 className="mb-5 text-lg font-normal text-gray-500">Vous souhaitez vraiment modifier vos
                            informations personnelles ?</h3>
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
                            className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
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
        </div>
    );
}

export default UpdateUser;
