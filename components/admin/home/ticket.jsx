import React, {useEffect, useState} from 'react';
import {FaUsers} from "react-icons/fa";
import {BsCart2} from "react-icons/bs";
import TicketHeader from "@/components/admin/home/ticketHeader";
import {RiAuctionLine} from "react-icons/ri";
import {BiWorld} from "react-icons/bi";

function Ticket() {
    const [counts, setCounts] = useState({ users: 0, products: 0, auctions: 0, orders: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await fetch('/api/admin/count');
                const data = await response.json();
                setCounts(data);
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();
    }, []);
    return (
        <div className="flex flex-wrap -mx-3">
            <TicketHeader icon={FaUsers} productName="Utilisateurs" quantity={counts.users} />
            <TicketHeader icon={BsCart2} productName="Produits" quantity={counts.products} />
            <TicketHeader icon={BiWorld} productName="Utilisateurs connectés aujourd'hui" quantity={counts.connectedUsersToday} />
            <TicketHeader icon={RiAuctionLine} productName="Enchères" quantity={counts.auctions} />

        </div>
    );
}

export default Ticket;