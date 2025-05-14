import React, {useMemo, useState} from 'react';
import LoadingPage from "@/components/UI/LoadingPage";
import Table from "@/components/jewelry/products/table/Table";
import GeneratePdfButton from "@/components/UI/GeneratePdfButton";

function FilterableTable({columns, data, showTitle = true}) {
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const normalizeDate = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const productCodes = item.rows ? item.rows.map(product => product.code.toLowerCase()).join(", ") : "";
            const firstProductStatus = item.rows?.[0]?.status;

            const matchesSearchText = item.formattedGuaranteeId?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.clientCode?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
                productCodes.includes(searchText.toLowerCase());

            const itemDate = normalizeDate(item.updatedAt);
            const start = startDate ? normalizeDate(startDate) : null;
            const end = endDate ? normalizeDate(endDate) : null;
            const matchesDateRange = (!start || itemDate >= start) && (!end || itemDate <= end);
            // Changed to filter by first product status instead of selectedComponent
            const matchesStatus = selectedStatus ?
                (firstProductStatus && selectedStatus.includes(firstProductStatus)) : true;

            return matchesSearchText && matchesStatus && matchesDateRange;
        });
    }, [data, searchText, selectedStatus, startDate, endDate]);

    const suppliersCount = useMemo(() => filteredData.length, [filteredData]);

    function handleClear() {
        setSearchText('');
    }

    function handleCheckboxChange(value) {
        if (value === selectedStatus) {
            setSelectedStatus(null);
        } else {
            setSelectedStatus(value);
        }
    }

    const pdfColumns = {
        'formattedGuaranteeId': 'code',
        'clientCode': 'Code Client',
        'productCodes': 'Code Produit',
        'name': 'Nom',
        'phone': 'Contact',
        'price': 'Prix',
        'advance': 'Avance',
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
                                   data={filteredData.map(item => ({
                                       ...item,
                                       productCodes: item.rows ? item.rows.map(product => product.code).join(", ") : ""
                                   }))}
                                   columnsConfig={pdfColumns}
                                   title="Liste des Facilité"
                />
            </div>

            <div className="flex gap-10 mt-2 justify-start flex-wrap">
                <div className="mt-2">
                    <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Type</h1>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700  ${selectedStatus === "Sold" ? 'text-white bg-blue-700 ' : 'text-blue-700   '}`}
                            onClick={() => handleCheckboxChange("Sold")}
                        >
                            <span>Vendu</span>
                        </button>
                        <button
                            type="button"
                            className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700   ${selectedStatus === "Facilité" ? 'text-white bg-blue-700 ' : 'text-blue-700 '}`}
                            onClick={() => handleCheckboxChange("Facilité")}
                        >
                            <span>Facilité</span>
                        </button>
                        <button
                            type="button"
                            className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700  ${selectedStatus === "Crédit" ? 'text-white bg-blue-700  ' : 'text-blue-700 '}`}
                            onClick={() => handleCheckboxChange("Crédit")}
                        >
                            <span>Crédit</span>
                        </button>

                    </div>

                </div>
                <div className="mt-2"><h1
                    className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Plage
                    de dates</h1>
                    <div className="flex flex-wrap justify-center items-center gap-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-blue-900" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                                </svg>
                            </div>
                            <input
                                id="datepicker-range-start"
                                name="start"
                                type="date"
                                className="bg-blue-50 border border-blue-300 text-blue-900 text-sm rounded-lg  outline-blue-700 focus-within:border-blue-700  focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                                placeholder="Sélectionnez la date de début"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <span className="mx-4 text-xl">à</span>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-blue-900" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                                </svg>
                            </div>
                            <input
                                id="datepicker-range-end"
                                name="end"
                                type="date"
                                className="bg-blue-50 border border-blue-300 text-blue-900 text-sm rounded-lg outline-blue-700  focus-within:border-blue-700
                                 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                                placeholder="Sélectionnez la date de fin"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-4 flex justify-center gap-4 flex-wrap">
                <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">
                    Nombre total: <span className="font-medium pr-1 pl-1 text-blue-700">{suppliersCount}</span>
                </h1>
            </div>

            <div className="flex justify-center mt-2">
                <Table columns={columns} data={filteredData}/>
            </div>
        </div>
    );
}

export default FilterableTable;