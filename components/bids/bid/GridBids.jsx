import React from 'react';
import BidItem from "@/components/bids/bid/bidItem";

function GridBids({bids}) {

    return (

        <ul className="grid gap-4 lg:p-5 sm:p-1  lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 justify-center ">
            {bids.map(bid => bid.status === "Active" && <li key={bid.id}>
                <BidItem {...bid}  />
            </li>)}


        </ul>
    );
}

export default GridBids;