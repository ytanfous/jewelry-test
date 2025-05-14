import React from 'react';
import Link from "next/link";

function DropdownMenu({ title, items, isOpen, toggleDropdown }) {
    return (
        <div className="relative">
            <button
                className="p-1 font-sans text-sm antialiased font-medium leading-normal text-blue-gray-900 flex items-center transition-colors hover:text-blue-500"
                onClick={toggleDropdown}
            >
                {title}
                <span className="ml-2">
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                             stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                             stroke="currentColor" aria-hidden="true" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </span>
            </button>
            {isOpen && (
                <ul className="absolute p-1 text-nowrap bg-white border min-w-48 rounded shadow-lg mt-2 z-10">
                    {items.map((item, index) => (
                        <Link href={item.href} key={index} onClick={toggleDropdown}>
                            <li className="p-2 hover:bg-blue-50 cursor-pointer">
                                {item.label}
                            </li>
                        </Link>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default DropdownMenu;