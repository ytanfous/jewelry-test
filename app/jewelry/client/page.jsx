"use client"
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSession} from "next-auth/react";
import {ImBin, ImPrinter, ImProfile} from "react-icons/im";
import Header from "@/components/bids/header/header";
import FilterableTables from "@/components/jewelry/client/FilterableTables";
import {CgProfile} from "react-icons/cg";
import {CiUser} from "react-icons/ci";
import Link from "next/link";

function Page() {
    const {data: session} = useSession();
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const componentRefs = useRef([]);

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/client/gets?userId=${session.user.id}`);

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setClients(data); // Update the state


                    if (!Array.isArray(data)) {
                        throw new Error('Data is not an array');
                    }
                } catch (error) {
                    console.error('Error fetching clients:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [session]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} à ${hours}:${minutes}`;
    };

    const columns = useMemo(() => [
        {Header: "Code Client", accessor: "clientCode"},
        {Header: "Nom et Prénom ", accessor: "name", Cell: ({value}) => (value ? value : '-')},
        {Header: "Téléphone", accessor: "phone", Cell: ({value}) => (value ? value : '-')},
        {Header: "Emplacement", accessor: "location", Cell: ({value}) => (value ? value : '-')},
        {
            Header: "Ma7lol",
            accessor: "savings",
            Cell: ({row}) => (row.original?._count?.savings ?? '0'),
        }, {
            Header: "Facilité",
            accessor: "guarantee",
            Cell: ({row}) => (row.original?._count?.guarantee ?? '0'),
        }, {
            Header: "Commandes",
            accessor: "orders",
            Cell: ({row}) => (row.original?._count?.orders ?? '0'),
        },
        {
            Header: "Action", accessor: "action", Cell: ({row}) => {
                const productRef = useRef();
                componentRefs.current[row.original.id] = productRef;

                return (
                    <div className="flex gap-1">
                        <Link href={`/jewelry/client/${row.original.id}`}
                              className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2 text-center me-2 mb-2 "
                        >Plus de détails
                        </Link>
                    </div>
                );
            },
        },
    ], []);


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header title="Liste des clients"/>
            <FilterableTables columns={columns} data={clients}/>
        </>
    );
}

export default Page;