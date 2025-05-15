"use client"
import React, {useState} from 'react';
import {signOut, useSession} from 'next-auth/react';
import NavLink from "@/components/bids/sidebar/nav-link";
import {useRouter} from "next/navigation";
import {GrUserAdmin} from "react-icons/gr";
import {MdAdminPanelSettings} from "react-icons/md";
import {GiCardboardBoxClosed} from "react-icons/gi";

function Sidebar() {
    const {data: session} = useSession();
    const router = useRouter();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const closeSidebar = () => {
        setSidebarVisible(false);
    };
    return (<>
        <button
            onClick={toggleSidebar}
            className="inline-flex items-center p-2 mt-2 ms-3 text-sm rounded-lg sm:hidden focus:outline-none focus:ring-2 text-gray-400  hover:bg-gray-700 focus:ring-gray-600">
            <span className="sr-only">Open sidebar</span>
            <svg
                className="w-8 h-8"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
        </button>
        {sidebarVisible && <button onClick={closeSidebar}
                                   className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
            <span className="sr-only">Close sidebar</span>
            <svg
                className="w-10 h-10"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 11-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z"></path>
            </svg>
        </button>}
        <aside id="default-sidebar"
               className={`fixed top-0 left-0 z-40 w-58 h-screen transition-transform -translate-x-full sm:translate-x-0 ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}
               aria-label="Sidebar" aria-hidden={!sidebarVisible}>

            <div className="h-full px-3 py-4 overflow-y-auto  bg-gray-800 ">
                <ul className="space-y-2 font-medium">
                    <li>
                        <NavLink href="/auction">
                            <svg className="flex-shrink-0 w-5 h-5 transition duration-75 text-white "
                                 aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                 viewBox="0 0 20 21">
                                <path fillRule="evenodd"
                                      d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                                      clipRule="evenodd"/>
                            </svg>

                            <span className="flex-1 ms-3 whitespace-nowrap">Accueil</span>
                        </NavLink>
                    </li>
{/*                    <li>
                        <NavLink href="#">
                            <svg
                                className="flex-shrink-0 w-5 h-5 transition duration-75  text-white"
                                aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                viewBox="0 0 20 18">
                                <path
                                    d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Profile</span>
                        </NavLink>
                    </li>*/}
                    <li>

                        <NavLink href="/auction/listAuction">
                            <svg
                                className="flex-shrink-0 w-5 h-5 transition duration-75  text-white"
                                aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                viewBox="0 0 18 20">
                                <path
                                    d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Liste d'enchères</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink href="/auction/addAuction">
                            <svg className="w-[20px] h-[20px] text-gray-800 dark:text-white" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                 viewBox="0 0 24 24">
                                <path fillRule="evenodd"
                                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z"
                                      clipRule="evenodd"/>
                            </svg>

                            <span className="flex-1 ms-3 whitespace-nowrap">Ajouter une enchère</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink href="/jewelry">
                            <GiCardboardBoxClosed className="w-[20px] h-[20px] text-gray-800 dark:text-white"/>

                            <span className="flex-1 ms-3 whitespace-nowrap">Gestion des stocks</span>
                        </NavLink>
                    </li>

                    {session?.user.type === 'admin' && <li>
                        <NavLink href="/admin">

                            <MdAdminPanelSettings  className="w-[20px] h-[20px] text-gray-800 dark:text-white"/>
                            <span className="flex-1 ms-3 whitespace-nowrap">Administration</span>
                        </NavLink>
                    </li>}
                    <li>
                        <button onClick={async () => {
                            await signOut({redirect: false});
                            window.location.href = '/';
                        }}
                                className={`flex items-center text-start p-2 rounded-lg text-white hover:bg-gray-700 group  w-full `}
                        >
                            <svg
                                className="flex-shrink-0 w-5 h-5 transition duration-75 text-white"
                                aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 18 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Déconexion</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    </>);
}

export default Sidebar;