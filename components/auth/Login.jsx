"use client"
import React, {useState} from 'react';
import Image from 'next/image';
import logo from '@/assests/logo.png';
import {signIn, useSession} from 'next-auth/react';
import ErrorComponent from '@/components/UI/ErrorComponent';
import {useRouter} from "next/navigation";
import { BiSolidHide, BiSolidShow} from "react-icons/bi";

function Login() {
    const {data: session} = useSession();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const username = formData.get('name');
        const password = formData.get('password');
        const result = await signIn('credentials', {username, password, redirect: false});
        if (!result.error) {
            try {
                // Fetch user role by sending the username in the request body
                const res = await fetch('/api/auth/getRole', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),  // Send username in body
                });

                const data = await res.json();

                // Redirect based on the user role
                if (data?.type === 'admin') {
                    router.push('/jewelry');
                } else {
                    router.push('/jewelry');
                }

            } catch (err) {
                console.error('Failed to fetch user role:', err);
            }
        } else {
            setLoading(false);
            setError(result.error);
        }
    };


    return (
        <section className="h-full bg-gradient-to-r from-cyan-500 to-blue-500">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <a href="#" className="flex items-center mb-6 text-2xl ">
                            <Image className="items-center mr-2" src={logo} priority alt="logo"/>
                        </a>
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                            Connectez-vous à votre compte !
                        </h1>
                        <div className="flex flex-wrap flex-col justify-start text-[16px] font-bold mb-2">
                            {error && <ErrorComponent text="Erreur dans le nom d'utilisateur ou le mot de passe"/>}

                        </div>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                                    Login
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                    placeholder="nom d'utilisateur"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                    Mot de passe
                                </label>
                                <div className="flex relative items-center">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex align-middle items-center px-2 border-l border-gray-300"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <BiSolidHide/> : <BiSolidShow/>}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
                            >
                                {loading ? 'Chargement...' : 'se connecter'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;
