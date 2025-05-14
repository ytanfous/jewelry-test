"use client"
import React, {useMemo, useState} from 'react';
import Table from "@/components/jewelry/products/table/Table";
import GeneratePdfButton from "@/components/UI/GeneratePdfButton";

function ListSavings({columns, data,    showTitle=true}) {
    const [searchText, setSearchText] = useState('');
    const filteredData = useMemo(() => {
        return data.filter(item => {
            return item.UserSavingSequence.toLowerCase().includes(searchText.toLowerCase()) || item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.clientCode?.toLowerCase().includes(searchText.toLowerCase()) ;
        });
    }, [data, searchText]);
    const productCount = useMemo(() => filteredData.length, [filteredData]);
    const productAmountCount = useMemo(() => {
        return filteredData.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, [filteredData]);

    function handleClear() {
        setSearchText('');
    }

    const pdfColumns = {
        'UserSavingSequence': 'code',
        'clientCode': 'Code Client',
        'name': 'Nom',
        'phone': 'Contact',
        'location': 'Localisation',
        'amount': 'Montant ',
        'createdAt': 'Date Création',
        'updatedAt': 'Date modifier',
    };


    return (
        <div>
            <div className="flex flex-wrap  items-center justify-between  gap-4 mb-4">
                {/* Search div - centered */}
                <div className="flex-1 max-w-2xl mx-auto">
                    <div className="relative flex items-center h-12 border border-gray-200 rounded-lg shadow focus-within:border-blue-700 focus-within:border-2 bg-white overflow-hidden">
                        <div className="grid place-items-center h-full w-12 text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
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
                            <div className="grid place-items-center h-full w-12 text-gray-300 cursor-pointer" onClick={handleClear}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* PDF button - right aligned */}
                <GeneratePdfButton
                    data={filteredData}
                    columnsConfig={pdfColumns}
                    title="Liste des Ma7lol"
                />
            </div>


            {showTitle ?             <div className="mt-4 flex justify-center gap-4 flex-wrap">
                <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Nombre
                    total de personnes ayant une Épargne: <span
                        className="font-medium  pr-1 pl-1 text-blue-700">{productCount}</span>
                </h1>

            </div> :     <div className="mt-4 flex justify-center gap-4 flex-wrap">
                <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Montant
                    total : <span
                        className="font-medium  pr-1 pl-1 text-blue-700">{productAmountCount}</span>
                </h1>

            </div>}

            <div className="flex justify-center mt-2">
                <Table columns={columns} data={filteredData}/>
            </div>
        </div>
    );
}

export default ListSavings;