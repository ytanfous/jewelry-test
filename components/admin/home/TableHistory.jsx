import React, {useEffect, useMemo, useState} from 'react';
import {useSession} from "next-auth/react";
import Table from "@/components/jewelry/products/table/Table";

function TableHistory({id}) {
    const {data: session} = useSession();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/admin/getHistory?userId=${id}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    if (!Array.isArray(data)) {
                        throw new Error('Data is not an array');
                    }
                    // Sort the history by loginTime (newest first)
                    const sortedHistory = data.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
                    setHistory(sortedHistory);
                } catch (error) {
                    console.error('Error fetching history:', error);
                }
            }
        };
        fetchData();
    }, [id, session?.user?.id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${month}-${day}-${year} à ${hours}:${minutes}`;
    };

    const columns = useMemo(() => [
        {
            Header: "Heure de connexion", accessor: "loginTime", Cell: ({value}) => (<>{formatDate(value)}</>)
        },
        {
            Header: "IP Address",
            accessor: "ipAddress",
            Cell: ({value}) => <>{value !== null ? `${value}` : '-'}</>
        },

    ], []);

    return (
        <div className="w-full max-w-full px-3 mb-6  sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div
                className="relative flex flex-col p-3 min-w-0 break-words gap-1 shadow-md rounded-2xl bg-clip-border
                 transition-transform duration-300 ease-in-out  bg-white">

                <Table columns={columns} data={history} size={10}/>

            </div>
        </div>
    );
}

export default TableHistory;