"use client";
import React, { useMemo, useState } from 'react';
import Table from "@/components/jewelry/products/table/Table";

function ListSlaf({ columns, data }) {
    const [searchText, setSearchText] = useState('');

    // Filter data based on search text
    const filteredData = useMemo(() => {
        return data.filter(item => {
            return item.code.toLowerCase().includes(searchText.toLowerCase());
        });
    }, [data, searchText]);

    // Calculate the total number of filtered items
    const productCount = useMemo(() => filteredData.length, [filteredData]);

    // Calculate the total sum of the `amount` field for each unit
    const calculateTotalAmountByUnit = () => {
        return filteredData.reduce((acc, item) => {
            const unit = item.unit || '-'; // Default to 'Unknown' if unit is missing
            const amount = parseFloat(item.amount) || 0; // Ensure amount is a number
            acc[unit] = (acc[unit] || 0) + amount; // Add to the total for the unit
            return acc;
        }, {});
    };

    // Get the total amounts by unit
    const totalAmountsByUnit = calculateTotalAmountByUnit();

    // Clear the search input
    function handleClear() {
        setSearchText('');
    }

    return (
        <div>
            {/* Search Input */}
            <div className="max-w-md mx-auto mt-2">
                <div className="relative flex items-center w-full h-12 border border-gray-200 rounded-lg shadow focus-within:border-blue-700 focus-within:border-2 bg-white overflow-hidden">
                    <div className="grid place-items-center h-full w-12 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                    <input
                        className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                        type="text"
                        id="search"
                        placeholder="Rechercher une Slaf avec le code ou nom ..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <div className="grid place-items-center h-full w-12 text-gray-300 cursor-pointer" onClick={handleClear}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Display Total Count and Total Amount by Unit */}
            <div className="mt-4 flex justify-center gap-4 flex-wrap">
                <h1 className="font-light leading-none tracking-tight text-gray-900 text-xl border-b-2 pb-2 mb-2">
                    Nombre total de Slaf: <span className="font-medium pr-1 pl-1 text-blue-700">{productCount}</span>
                </h1>
                {Object.entries(totalAmountsByUnit).map(([unit, total]) => (
                    <h1 key={unit} className="font-light leading-none tracking-tight text-gray-900 text-xl border-b-2 pb-2 mb-2">
                        Montant total ({unit}): <span className="font-medium pr-1 pl-1 text-blue-700">{total.toFixed(2)}</span>
                    </h1>
                ))}
            </div>

            {/* Table Component */}
            <div className="flex justify-center mt-2">
                <Table columns={columns} data={filteredData} />
            </div>
        </div>
    );
}

export default ListSlaf;