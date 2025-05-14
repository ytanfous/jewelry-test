"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoCloseSharp } from 'react-icons/io5';
import { RxHamburgerMenu } from 'react-icons/rx';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';

function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleDropdown = (index) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    const dropdownItems = [
        { label: 'Ajouter une Commande Client', href: '/jewelry/order/addOrder' },
        { label: 'Liste des commandes Clients', href: '/jewelry/order/listOrders' },
        { label: 'Ajouter une Commande Fournisseur', href: '/jewelry/order/addOrderSupplier' },
        { label: 'Liste des commandes Fournisseurs', href: '/jewelry/order/listOrdersSuppliers' },
    ];

    const dropdownItems2 = [
        { label: 'Ajouter une Ma7lol', href: '/jewelry/saving/addSaving' },
        { label: 'Liste des Ma7lol', href: '/jewelry/saving/listSavings' },
    ];

    const dropdownItems3 = [
        { label: 'Ajouter un produit', href: '/jewelry/products/addProduct' },
        { label: 'Liste des produits', href: '/jewelry/products/listProducts' },
    ];

    const dropdownItems4 = [
        { label: 'Ajouter', href: '/jewelry/guarantee' },
        { label: 'Liste', href: '/jewelry/guarantee/listGuarantee' },
    ];

    const handleNavbarClick = () => {
        setOpenDropdown(null); // Close all dropdowns
    };

    return (
        <div className="w-full p-2 md:flex sm:justify-end">
            {/* Desktop Navbar */}
            <nav className="hidden md:inline-block px-6 py-3 mt-2 mx-auto bg-blue-50 z-50 border shadow-md rounded-xl border-blue/80 bg-opacity-80 backdrop-blur-2xl backdrop-saturate-200">
                <div className="flex items-center justify-between text-blue-gray-900">
                    <div>
                        <ul className="flex flex-col gap-2 my-2 md:mb-0 md:mt-0 md:flex-row md:items-center md:gap-6">
                            <Link href="/jewelry" onClick={handleNavbarClick}>
                                <div className={`block p-1 font-sans text-sm antialiased font-medium leading-normal ${pathname === '/jewelry' ? 'text-blue-500' : 'text-gray-900'} hover:text-blue-500`}>Accueil</div>
                            </Link>
                            <DropdownMenu title="Produit" items={dropdownItems3} isOpen={openDropdown === 2} toggleDropdown={() => toggleDropdown(2)} />
                            <DropdownMenu title="Commandes" items={dropdownItems} isOpen={openDropdown === 0} toggleDropdown={() => toggleDropdown(0)} />
                            <DropdownMenu title="Facilité" items={dropdownItems4} isOpen={openDropdown === 3} toggleDropdown={() => toggleDropdown(3)} />
                            <DropdownMenu title="Ma7lol" items={dropdownItems2} isOpen={openDropdown === 1} toggleDropdown={() => toggleDropdown(1)} />
                            <Link href="/jewelry/client" onClick={handleNavbarClick}>
                                <div className={`block p-1 font-sans text-sm antialiased font-medium leading-normal ${pathname === '/jewelry/client' ? 'text-blue-500' : 'text-gray-900'} hover:text-blue-500`}>Client</div>
                            </Link>
                            <Link href="/jewelry/UpdateUser" onClick={handleNavbarClick}>
                                <div className={`block p-1 font-sans text-sm antialiased font-medium leading-normal ${pathname === '/jewelry/UpdateUser' ? 'text-blue-500' : 'text-gray-900'} hover:text-blue-500`}>Profil</div>
                            </Link>
                            <Link href="/jewelry/jeweler/create" onClick={handleNavbarClick}>
                                <div className={`block p-1 font-sans text-sm antialiased font-medium leading-normal ${pathname === '/jewelry/jeweler/create' ? 'text-blue-500' : 'text-gray-900'} hover:text-blue-500`}>Ajouter Bijouter</div>
                            </Link>
                            <Link href="/jewelry/option" onClick={handleNavbarClick}>
                                <div className={`block p-1 font-sans text-sm antialiased font-medium leading-normal ${pathname === '/jewelry/option' ? 'text-blue-500' : 'text-gray-900'} hover:text-blue-500`}>Option</div>
                            </Link>

                            <li className="block p-1 font-sans text-sm antialiased font-medium leading-normal text-gray-900">
                                <button
                                    onClick={async () => {
                                        await signOut({ redirect: false });
                                        window.location.href = '/';
                                    }}
                                    className={`flex items-center transition-colors hover:text-blue-500`}
                                >
                                    <span className="flex items-center transition-colors hover:text-blue-500">Déconexion</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <div className="md:hidden">
                {/* Hamburger Menu Button */}
                <button
                    onClick={toggleMenu}
                    className={`p-2  ${isOpen ? 'right-0 fixed' : 'left-0 flex'} top-0 z-50 bg-white`}
                >
                    {isOpen ? <IoCloseSharp size={24} /> :
                        <> <div className="flex justify-center  text-white items-center rounded bg-black w-10 h-10"><RxHamburgerMenu size={30} /></div></> }
                </button>

                {/* Mobile Menu Overlay and Content */}
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                onClick={() => setIsOpen(false)}
                            />

                            {/* Mobile Menu Content */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4">
                                    {/* Home Link */}
                                    <Link href="/jewelry">
                                        <div
                                            className={`block p-4 ${
                                                pathname === '/jewelry' ? 'text-blue-500' : 'text-black'
                                            } hover:bg-gray-100 rounded`}
                                        >
                                            Accueil
                                        </div>
                                    </Link>

                                    {/* Produit Dropdown */}
                                    <div className="p-4">
                                        <button
                                            onClick={() => toggleDropdown(2)}
                                            className="text-black hover:text-blue-500 flex items-center gap-2"
                                        >
                                            Produit
                                            <MdKeyboardArrowDown
                                                className={`transform transition-transform duration-300 ${
                                                    openDropdown === 2 ? '-rotate-90' : 'rotate-0'
                                                }`}
                                            />
                                        </button>
                                        {openDropdown === 2 && (
                                            <div className="pl-4 mt-2">
                                                {dropdownItems3.map((link) => (
                                                    <Link key={link.href} href={link.href}>
                                                        <div className="block py-2 hover:bg-gray-100 rounded">
                                                            {link.label}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Commandes Dropdown */}
                                    <div className="p-4">
                                        <button
                                            onClick={() => toggleDropdown(0)}
                                            className="text-black hover:text-blue-500 flex items-center gap-2"
                                        >
                                            Commandes
                                            <MdKeyboardArrowDown
                                                className={`transform transition-transform duration-300 ${
                                                    openDropdown === 0 ? '-rotate-90' : 'rotate-0'
                                                }`}
                                            />
                                        </button>
                                        {openDropdown === 0 && (
                                            <div className="pl-4 mt-2">
                                                {dropdownItems.map((link) => (
                                                    <Link key={link.href} href={link.href}>
                                                        <div className="block py-2 hover:bg-gray-100 rounded">
                                                            {link.label}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Facilité Dropdown */}
                                    <div className="p-4">
                                        <button
                                            onClick={() => toggleDropdown(3)}
                                            className="text-black hover:text-blue-500 flex items-center gap-2"
                                        >
                                            Facilité
                                            <MdKeyboardArrowDown
                                                className={`transform transition-transform duration-300 ${
                                                    openDropdown === 3 ? '-rotate-90' : 'rotate-0'
                                                }`}
                                            />
                                        </button>
                                        {openDropdown === 3 && (
                                            <div className="pl-4 mt-2">
                                                {dropdownItems4.map((link) => (
                                                    <Link key={link.href} href={link.href}>
                                                        <div className="block py-2 hover:bg-gray-100 rounded">
                                                            {link.label}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Ma7lol Dropdown */}
                                    <div className="p-4">
                                        <button
                                            onClick={() => toggleDropdown(1)}
                                            className="text-black hover:text-blue-500 flex items-center gap-2"
                                        >
                                            Ma7lol
                                            <MdKeyboardArrowDown
                                                className={`transform transition-transform duration-300 ${
                                                    openDropdown === 1 ? '-rotate-90' : 'rotate-0'
                                                }`}
                                            />
                                        </button>
                                        {openDropdown === 1 && (
                                            <div className="pl-4 mt-2">
                                                {dropdownItems2.map((link) => (
                                                    <Link key={link.href} href={link.href}>
                                                        <div className="block py-2 hover:bg-gray-100 rounded">
                                                            {link.label}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Client Link */}
                                    <Link href="/jewelry/client">
                                        <div
                                            className={`block p-4 ${
                                                pathname === '/jewelry/client' ? 'text-blue-500' : 'text-black'
                                            } hover:bg-gray-100 rounded`}
                                        >
                                            Client
                                        </div>
                                    </Link>

                                    {/* Profil Link */}
                                    <Link href="/jewelry/UpdateUser">
                                        <div
                                            className={`block p-4 ${
                                                pathname === '/jewelry/UpdateUser' ? 'text-blue-500' : 'text-black'
                                            } hover:bg-gray-100 rounded`}
                                        >
                                            Profil
                                        </div>
                                    </Link>

                                    {/* Ajouter Bijouter Link */}
                                    <Link href="/jewelry/jeweler/create">
                                        <div
                                            className={`block p-4 ${
                                                pathname === '/jewelry/jeweler/create' ? 'text-blue-500' : 'text-black'
                                            } hover:bg-gray-100 rounded`}
                                        >
                                            Ajouter Bijouter
                                        </div>
                                    </Link>

                                    {/* Option Link */}
                                    <Link href="/jewelry/option">
                                        <div
                                            className={`block p-4 ${
                                                pathname === '/jewelry/option' ? 'text-blue-500' : 'text-black'
                                            } hover:bg-gray-100 rounded`}
                                        >
                                            Option
                                        </div>
                                    </Link>

                                    {/* Enchères Link */}
                                    {(session?.user.type === 'user-auction' || session?.user.type === 'admin') && (
                                        <Link href="/auction">
                                            <div
                                                className={`block p-4 ${
                                                    pathname === '/auction' ? 'text-blue-500' : 'text-black'
                                                } hover:bg-gray-100 rounded`}
                                            >
                                                Enchères
                                            </div>
                                        </Link>
                                    )}

                                    {/* Administration Link */}
                                    {session?.user.type === 'admin' && (
                                        <Link href="/admin">
                                            <div
                                                className={`block p-4 ${
                                                    pathname === '/admin' ? 'text-blue-500' : 'text-black'
                                                } hover:bg-gray-100 rounded`}
                                            >
                                                Administration
                                            </div>
                                        </Link>
                                    )}

                                    {/* Sign Out Button */}
                                    <button
                                        onClick={async () => {
                                            await signOut({ redirect: false });
                                            window.location.href = '/';
                                        }}
                                        className="block w-full px-4 py-2 text-black hover:bg-gray-100 rounded text-left"
                                    >
                                        Déconexion
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Navbar;

// DropdownMenu Component
const DropdownMenu = ({ title, items, isOpen, toggleDropdown }) => {
    return (
        <li className="relative">
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 p-1 font-sans text-sm antialiased font-medium leading-normal text-gray-900 hover:text-blue-500"
            >
                {title}
                <MdKeyboardArrowDown
                    className={`transform transition-transform duration-300 ${
                        isOpen ? '-rotate-90' : 'rotate-0'
                    }`}
                />
            </button>
            {isOpen && (
                <ul className="absolute left-0 mt-2 min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {items.map((item, index) => (
                        <li key={index}>
                            <Link href={item.href}>
                                <div className="block px-4 py-2 text-gray-700 text-nowrap hover:bg-gray-100">
                                    {item.label}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};