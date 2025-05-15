import {useEffect, useRef, useState} from 'react';
import {GrUpdate} from "react-icons/gr";
import Link from "next/link";

const Dropdown = ({handleUpdate, value, id}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (<div className=" inline-block text-left" ref={dropdownRef}>
        <button
            onClick={toggleDropdown}
            type="button"
            className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none
                          font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            id="dropdownMenuIconHorizontalButton"
            aria-haspopup="true"
            aria-expanded={isOpen ? 'true' : 'false'}
        >
            <GrUpdate/>
        </button>

        {isOpen && (<div
            className="absolute right-4 z-10 bg-white divide-y divide-blue-100 rounded-lg border border-blue-700 shadow w-44"
            id="dropdownDotsHorizontal"
            aria-labelledby="dropdownMenuIconHorizontalButton"
        >
            <ul className="py-2 text-sm text-gray-700">
                {value !== "Active" && <li>
                    <a href="#" onClick={() => handleUpdate(id, "Active")}
                       className="block px-4 py-2 hover:bg-gray-100 ">
                        Active
                    </a>
                </li>}
                {value !== "En Attente" && <li>
                    <a href="#" onClick={() => handleUpdate(id, "En Attente")}
                       className="block px-4 py-2 hover:bg-gray-100">
                        En Attente
                    </a>
                </li>}
                {value !== "Désactiver" && <li>
                    <a href="#" onClick={() => handleUpdate(id, "Désactiver")}
                       className="block px-4 py-2 hover:bg-gray-100 ">
                        Désactiver
                    </a>
                </li>}

            </ul>
            <div className="py-2">

                <Link href={`/auction/updateAuction/${id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mise à jour
                </Link>
                <Link href={`/auction/${id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Voir Détails
                </Link>
            </div>
        </div>)}
    </div>);
};

export default Dropdown;