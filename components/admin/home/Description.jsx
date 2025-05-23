import React from 'react';
import {FaArrowRight} from "react-icons/fa";
import logo from '@/assests/rings.png';
import jeweler from '@/assests/jeweler.png';

import Image from "next/image";

function Description() {
    return (
        <div className="flex flex-wrap mt-6 -mx-3">
            <div className="w-full px-3 mb-6 lg:mb-0 lg:w-7/12 lg:flex-none">
                <div
                    className="relative flex flex-col min-w-0 break-words bg-white shadow-md rounded-2xl bg-clip-border">
                    <div className="flex-auto p-4">
                        <div className="flex flex-wrap -mx-3">
                            <div className="max-w-full px-3 lg:w-1/2 lg:flex-none">
                                <div className="flex flex-col h-full">
                                    <p className="pt-2 mb-1 font-semibold">Conçu pour simplifier vos opérations</p>
                                    <h5 className="font-bold">Gestion des Bijoutiers et Enchères</h5>
                                    <p className="mb-12">Optimisez vos opérations de bijouterie et enchères avec une
                                        solution complète pour gérer vos données en toute simplicité.</p>

                                    <a className="mt-auto mb-0 font-semibold leading-normal text-sm group text-slate-500 "
                                       href="javascript:;">
                                        En savoir plus
                                        <FaArrowRight className="ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-2" />
                                    </a>
                                </div>
                            </div>
                            <div
                                className="hidden lg:block max-w-full px-3 mt-12 ml-auto text-center lg:mt-0 lg:w-5/12 lg:flex-none">
                                <div className="h-full bg-gradient-to-tl from-blue-600 to-pink-300 rounded-xl">
                                    <div className="relative flex items-center justify-center h-full">
                                        <Image className="relative z-20 pt-6 w-48 h-auto" src={logo} alt="rocket"/>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-full px-3 lg:w-5/12 lg:flex-none">
                <div
                    className="border-black/12.5 shadow-md relative flex h-full min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border p-4">
                    <div className="relative h-full overflow-hidden bg-cover rounded-xl"
                         style={{backgroundImage: `url(${jeweler.src})`}}>

                        <span
                            className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-to-tl from-gray-900 to-slate-800 opacity-80"></span>
                        <div className="relative z-10 flex flex-col flex-auto h-full p-4">
                            <h5 className="pt-2 mb-6 font-bold text-white">Créer l'élégance intemporelle</h5>
                            <p className="text-white">La création de bijoux est un art qui allie précision et
                                créativité. Tout est question de saisir l'instant pour façonner la beauté et la valeur à
                                partir des matériaux les plus précieux.</p>

                            <a className="mt-auto mb-0 font-semibold leading-normal text-white group text-sm cursor-pointer"
                            >

                                En savoir plus
                                <FaArrowRight className="ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-2" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Description;