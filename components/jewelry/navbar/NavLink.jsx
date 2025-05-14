"use client"
import React from 'react';
import Link from "next/link";
import {usePathname} from "next/navigation";

function NavLink({href, text,setOpenDropdown}) {
    const path = usePathname();
    const handleClick = () => {
        if (setOpenDropdown) {
            setOpenDropdown(null);
        }
    };
    return (
        <li className={`block p-1 font-sans text-sm antialiased font-medium leading-normal ${path.endsWith(href) ? 'text-blue-500' : 'text-blue-gray-900'} `}>
            <Link href={href} onClick={handleClick} className="flex items-center transition-colors hover:text-blue-500">
                {text}
            </Link>
        </li>
    );
}

export default NavLink;
