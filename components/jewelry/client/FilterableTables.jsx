import React, { useMemo, useState } from 'react';
import Table from "@/components/jewelry/products/table/Table";

function FilterableTables({ columns, data }) {

    const [searchText, setSearchText] = useState('');

    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) {
            return [];
        }
        return data.filter(item => {
            const matchesSearchText =
                item.clientCode?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.phone?.toLowerCase().includes(searchText.toLowerCase());
            return matchesSearchText; // Ensure the filter returns a boolean
        });
    }, [data, searchText]);

    const clientCount = useMemo(() => filteredData.length, [filteredData]);

    function handleClear() {
        setSearchText('');
    }

    return (
        <div>
            <div className="max-w-md mx-auto">
                <div
                    className="relative flex items-center w-full h-12 border border-gray-200 rounded-lg shadow focus-within:border-blue-700 focus-within:border-2 bg-white overflow-hidden"
                >
                    <div className="grid place-items-center h-full w-12 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                    <input
                        className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                        type="text"
                        id="search"
                        placeholder="Rechercher un client par code, nom ou téléphone..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <div className="grid place-items-center h-full w-12 text-gray-300 cursor-pointer"
                             onClick={handleClear}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center mt-2">
                <Table columns={columns} data={filteredData} size={10}/>
            </div>
        </div>
    );
}

export default FilterableTables;