"use client"
import React, {useState} from 'react';
import {BiHide, BiShow, BiSolidHide, BiSolidShow} from "react-icons/bi";

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };
    const togglePasswordVisibility1 = () => {
        setShowPassword1((prevShowPassword) => !prevShowPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const response = await fetch('/api/register/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            });
            const data = await response.json();
            if (response.ok) {
                console.log('User created successfully');
                window.location.href = data.redirect;
            } else {
                console.error('Failed to create user');
            }
        } catch (error) {
            console.error('Failed to create user', error);
        }
    };

    return (
        <section className="h-full bg-gradient-to-r from-cyan-500 to-blue-500">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">

                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">

                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                            Créez un compte 
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">nom
                                    d'utilisateur</label>
                                <input type="text" name="username" id="username"
                                       className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                       placeholder="nom d'utilisateur" required/>
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Mot
                                    de passe</label>
                                <div className="flex relative items-center">
                                    <input
                                        type={showPassword1 ? 'text' : 'password'}
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center px-2 border-l border-gray-300"
                                        onClick={togglePasswordVisibility1}
                                    >
                                        {showPassword1 ? <BiSolidHide/> : <BiSolidShow/>}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword"
                                       className="block mb-2 text-sm font-medium text-gray-900">Vérifier le mot de
                                    passe</label>
                                <div className="flex relative items-center">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center px-2 border-l border-gray-300"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <BiSolidHide/> : <BiSolidShow/>}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
                            >
                                Enregistrer
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Register;
