import React from 'react';
import InputGroup from "@/components/bids/bid/table/InputGroup";
import {FaSearch} from "react-icons/fa";

function GlobalSearchFilter({
                                globalFilter,
                                setGlobalFilter,
                                className = "",
                            }) {
    return (
        <InputGroup
            name="search"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            label="Search"
            decoration={<FaSearch size="1rem" className="text-gray-400"/>}
            className={className}
        />
    );
}

export default GlobalSearchFilter;