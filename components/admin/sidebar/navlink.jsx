'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children }) {
    const path = usePathname();

    // Ensure that /admin is active only when the path is exactly /admin
    const isAdminPath = href === '/admin' && path === '/admin';

    // For all other paths, check if the current path starts with the given href
    const isActive = isAdminPath || (href !== '/admin' && path.startsWith(href));

    return (
        <Link
            href={href}
            className={`flex items-center p-2 rounded-lg text-blue-900 hover:bg-white group ${isActive ? 'bg-white shadow-md' : undefined}`}
        >
            {children}
        </Link>
    );
}
