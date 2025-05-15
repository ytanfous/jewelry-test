'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

export default function NavLink({href, children}) {
    const path = usePathname();
    return (<Link
        href={href}
        className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${path.endsWith(href) ? `bg-gray-700 text-white` : undefined}`}
    >
        {children}
    </Link>);
}
