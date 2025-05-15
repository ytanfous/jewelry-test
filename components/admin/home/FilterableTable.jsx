import React, {useMemo, useState} from 'react';
import LoadingPage from "@/components/UI/LoadingPage";
import Table from "@/components/jewelry/products/table/Table";
import Link from "next/link";

function FilterableTable({columns, data}) {
    const [searchText, setSearchText] = useState('');

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const normalizedSearchText = searchText.toLowerCase();

            const matchesId = item.id != null && String(item.id).toLowerCase().includes(normalizedSearchText);
            const matchesCompanyName = item.CompanyName != null && String(item.CompanyName).toLowerCase().includes(normalizedSearchText);
            const matchesUsername = item.username != null && String(item.username).toLowerCase().includes(normalizedSearchText);
            const matchesName = item.name != null && String(item.name).toLowerCase().includes(normalizedSearchText);

            // Return true if any field matches
            return matchesId || matchesCompanyName || matchesUsername || matchesName;
        });
    }, [data, searchText]);


    const userCount = useMemo(() => filteredData.length, [filteredData]);

    function handleClear() {
        setSearchText('');
    }

    return (
        <div
            className="w-full mt-5 shadow-md relative flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border p-4">
            <div
                className="w-full mt-5  relative flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border p-4">
                <div className="flex flex-wrap mt-0   -mx-3 items-center">
                    <div className="flex-none w-full mb-2 max-w-full px-3 mt-0 lg:w-1/4 lg:flex-none">
                        <Link href="/admin/userlist/addUser"
                            className="rounded-xl bg-gradient-to-br from-blue-600 to-pink-300 px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-blueSecondary/50">
                            Ajouter un utilisateur
                        </Link>
                    </div>

                    <div className="flex-none w-full mb-2  max-w-full px-3 mt-2 text-center lg:w-1/2 lg:flex-none">
            <span className="text-lg  text-gray-700">
                Nombre total d'utilisateurs: <span className="font-semibold text-blue-700 text-xl">{userCount}</span>
            </span>
                    </div>

                    <div className="flex-none max-w-full px-3 my-auto text-right lg:w-1/4 lg:flex-none">
                        <div className="relative pr-6 lg:float-right">
                            <div
                                className="relative flex items-center w-full h-12 border border-blue-900 rounded-lg focus-within:border-blue-700 focus-within:border-2 bg-white overflow-hidden">
                                <div className="grid place-items-center h-full w-12 text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                         viewBox="0 0 24 24"
                                         stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <input
                                    className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                                    type="text"
                                    id="search"
                                    placeholder="Rechercher un produit avec le code..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                {searchText && (
                                    <div
                                        className="grid place-items-center h-full w-12 text-gray-300 cursor-pointer"
                                        onClick={handleClear}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                             viewBox="0 0 24 24"
                                             stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-10">
                <Table columns={columns} data={filteredData}/>
            </div>
        </div>
    );
}

export default FilterableTable;