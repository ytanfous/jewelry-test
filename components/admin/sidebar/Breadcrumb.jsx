'use client';

import Link from 'next/link'; // Import Link from Next.js
import { usePathname } from 'next/navigation';

function Breadcrumb() {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean);

    // Mapping of specific path segments to custom names
    const segmentNameMap = {
        'userlist': 'Liste des utilisateurs',
        'adduser': 'Ajouter un utilisateur',
        'setting': 'Paramètres',
    };

    return (
        <nav aria-label="breadcrumb">
            <ol className="flex space-x-2 text-gray-600 mb-2">
                <li className="breadcrumb-item">
                    Pages /
                </li>
                {pathSegments.map((segment, index) => {
                    const href = '/' + pathSegments.slice(0, index + 1).join('/');
                    const isLast = index === pathSegments.length - 1;

                    const displayName = segmentNameMap[segment.toLowerCase()] || (segment.charAt(0).toUpperCase() + segment.slice(1));

                    return (
                        <li key={index} className="inline-flex items-center">
                            {!isLast ? (
                                <Link href={href} className="hover:underline">
                                    {displayName}
                                </Link>
                            ) : (
                                <span className="text-blue-600 font-semibold underline">
                                    {displayName}
                                </span>
                            )}

                            {!isLast && <span className="mx-2">/</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumb;
