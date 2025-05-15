import React, {useState} from 'react';
import {usePathname} from "next/navigation";
import {signOut} from "next-auth/react";
import NavLink from "@/components/admin/sidebar/navlink";

import {GiBigDiamondRing} from "react-icons/gi";
import {PiUserList} from "react-icons/pi";
import {RiAuctionFill, RiAuctionLine, RiShoppingBagLine} from "react-icons/ri";
import {FaShoppingBag} from "react-icons/fa";
import {IoSettingsOutline} from "react-icons/io5";
import {BiHomeAlt2} from "react-icons/bi";

function SideBar(props) {
    const path = usePathname();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        await signOut({ redirect: false });
        window.location.href = '/';
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };
    const closeSidebar = () => {
        setSidebarVisible(false);
    };
    return (
        <>
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
                   className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}
                   aria-label="Sidebar" aria-hidden={!sidebarVisible}>

                <a className="block px-8 py-6 m-0 text-sm whitespace-nowrap text-slate-700"
                   target="_blank">
                    <GiBigDiamondRing  className="inline    text-3xl mr-1"/>

                    <span className="ml-1 font-semibold text-2xl">Space Admin</span>
                </a>
                <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent"/>
                <div className="h-full px-3 py-4 overflow-y-auto">
                    <ul className="space-y-2 ">
                        <li>
                            <NavLink href="/admin">

                                <div
                                    className={`bg-gradient-to-tl mr-2 flex bg-white h-8 w-8 shadow-md items-center justify-center rounded-lg   ${path.endsWith('/admin') ? `from-blue-600 to-pink-300 text-white ` : undefined}`}>
                                    <BiHomeAlt2  className={`w-5 h-5 ${path.endsWith('/UserList') ? `from-blue-600 to-pink-300 ` : undefined}\`}`}/>
                                </div>
                                <span className="flex-1 ms-3 whitespace-nowrap">Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href="/admin/userlist">
                                <div
                                    className={`bg-gradient-to-tl mr-2 flex bg-white h-8 w-8 shadow-md items-center justify-center rounded-lg  ${path.includes('/userlist') ? `from-blue-600 to-pink-300 text-white` : undefined}`}>

                                    <PiUserList
                                        className={`w-5 h-5 ${path.endsWith('/UserList') ? `from-blue-600 to-pink-300 ` : undefined}\`}`}/>
                                </div>
                                <span className="flex-1 ms-3 whitespace-nowrap">Liste des utilisateurs</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href="/admin/setting">
                                <div
                                    className={`bg-gradient-to-tl mr-2 flex bg-white h-8 w-8 shadow-md items-center justify-center rounded-lg  ${path.includes('/setting') ? `from-blue-600 to-pink-300 text-white` : undefined}`}>

                                    <IoSettingsOutline
                                        className={`w-5 h-5 ${path.endsWith('/setting') ? `from-blue-600 to-pink-300 ` : undefined}\`}`}/>
                                </div>
                                <span className="flex-1 ms-3 whitespace-nowrap">Paramètres</span>
                            </NavLink>
                        </li>
                        <li className="w-full mt-4">
                            <h6 className=" ml-2 font-bold leading-tight uppercase text-xs opacity-60">pages
                                d'application</h6>
                        </li>
                        <li>
                            <NavLink href="/jewelry">
                                <div
                                    className={`bg-gradient-to-tl mr-2 flex bg-white h-8 w-8 shadow-md items-center justify-center rounded-lg  ${path.includes('/jewelry') ? `from-blue-600 to-pink-300 text-white` : undefined}`}>

                                    <RiShoppingBagLine
                                        className={`w-5 h-5 ${path.endsWith('/UserList') ? `from-blue-600 to-pink-300 ` : undefined}\`}`}/>
                                </div>
                                <span className="flex-1 ms-3 whitespace-nowrap">Application de bijoutier</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href="/auction">
                                <div
                                    className={`bg-gradient-to-tl mr-2 flex bg-white h-8 w-8 shadow-md items-center justify-center rounded-lg  ${path.includes('/auction') ? `from-blue-600 to-pink-300 text-white` : undefined}`}>

                                    <RiAuctionLine
                                        className={`w-5 h-5 ${path.endsWith('/UserList') ? `from-blue-600 to-pink-300 ` : undefined}\`}`}/>
                                </div>
                                <span className="flex-1 ms-3 whitespace-nowrap">Application d'enchères</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href="#">
                                <div
                                    onClick={loading ? null : handleSignOut}
                                    className="flex items-center cursor-pointer"
                                >
                                    <div
                                        className={`bg-gradient-to-tl mr-2 flex h-8 w-8 items-center justify-center rounded-lg shadow-md ${path.endsWith('/') ? 'from-purple-700 to-pink-500' : undefined}`}
                                    >
                                        <div
                                            className="bg-gradient-to-tl  flex bg-white h-8 w-8  items-center justify-center rounded-lg">

                                            {loading ? (
                                                <svg className="animate-spin h-5 w-5 text-blue-900"
                                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                            ) : (
                                                <svg
                                                    className={`w-5 h-5 text-blue-900`}
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 18 16"
                                                >
                                                    <path stroke="currentColor" strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    {loading ? (
                                        <span className="flex-1 ms-3 whitespace-nowrap">Déconnexion ...</span>

                                    ) : (
                                        <span className="flex-1 ms-3 whitespace-nowrap">Déconnexion</span>

                                    )}
                                </div>
                            </NavLink>


                        </li>
                    </ul>
                </div>
            </aside>

        </>
    );
}

export default SideBar;