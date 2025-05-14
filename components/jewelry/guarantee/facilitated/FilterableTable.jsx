import React, {useState, useMemo} from 'react';
import {useFeatures} from "@/app/hooks/featuresApi";
import LoadingPage from "@/components/UI/LoadingPage";
import FilterComponent from "@/components/UI/FilterComponent";
import Table from "@/components/jewelry/products/table/Table";

function FilterableTable({columns, data}) {
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedTimeFilter, setSelectedTimeFilter] = useState("monthly");

    const filterByDate = (item) => {
        const now = new Date();
        const itemDate = new Date(item.date); // Replace with the actual date field

        switch (selectedTimeFilter) {
            case "today": {
                // Match today's date
                return itemDate.toDateString() === now.toDateString();
            }
            case "weekly": {
                // 3 days before and 3 days after today
                const weekStart = new Date();
                weekStart.setDate(now.getDate() - 3); // 3 days before today
                weekStart.setHours(0, 0, 0, 0); // Set to midnight

                const weekEnd = new Date();
                weekEnd.setDate(now.getDate() + 3); // 3 days after today
                weekEnd.setHours(23, 59, 59, 999); // Set to end of the day

                return itemDate >= weekStart && itemDate <= weekEnd;
            }
            case "monthly": {
                // Match current month
                return (
                    itemDate.getMonth() === now.getMonth() &&
                    itemDate.getFullYear() === now.getFullYear()
                );
            }
            default:
                return true;
        }
    };


    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearchText =
                item.guarantee.formattedGuaranteeId.toLowerCase().includes(searchText.toLowerCase()) ||
                item.guarantee.name?.toLowerCase().includes(searchText.toLowerCase());
            const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(item.status);
            const matchesDate = filterByDate(item);
            return matchesSearchText && matchesStatus && matchesDate;
        });
    }, [data, searchText, selectedStatus, selectedTimeFilter]);


    const productCount = useMemo(() => filteredData.length, [filteredData]);


    function handleClear() {
        setSearchText('');
    }

    function handleCheckboxChange(setSelectedFunction, value) {
        setSelectedFunction(prev => {
            if (prev.includes(value)) {
                return prev.filter(item => item !== value);
            } else {
                return [...prev, value];
            }
        });
    }

    const statuses = [
        {value: true, label: 'Reçu'},
        {value: false, label: 'Non Reçu'}
    ];

    const timeFilters = [
        {value: "today", label: "Aujourd'hui"},
        {value: "weekly", label: "Cette semaine"},
        {value: "monthly", label: "Ce mois"},
    ];
    return (
        <div>
            <div className="max-w-md mx-auto m-4">
                <div
                    className="relative flex items-center w-full h-12 border border-gray-200 rounded-lg  shadow focus-within:border-blue-700 focus-within:border-2 bg-white overflow-hidden">

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
                        placeholder="Rechercher avec le code..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (<div className="grid place-items-center h-full w-12 text-gray-300 cursor-pointer"
                                         onClick={handleClear}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </div>)}
                </div>
            </div>
            <div className="flex gap-10 justify-start flex-wrap mb-2">
                <div className="mt-2">
                    <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl text-left border-b-2 pb-2 mb-2">État </h1>
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg ${selectedStatus.includes(item.value) ?
                                    'text-white bg-blue-700 hover:bg-blue-200 hover:text-blue-700' : 'text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800'}`}
                                onClick={() => handleCheckboxChange(setSelectedStatus, item.value)}
                            >
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-2">
                    <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl text-left border-b-2 pb-2 mb-2">
                        Filtre par période
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        {timeFilters.map((filter) => (
                            <button
                                key={filter.value}
                                className={`text-sm px-3 py-2 font-medium rounded-lg ${
                                    selectedTimeFilter === filter.value
                                        ? "text-white bg-blue-700 hover:bg-blue-200 hover:text-blue-700"
                                        : "text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800"
                                }`}
                                onClick={() => setSelectedTimeFilter(filter.value)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Nombre
                total : <span
                    className="font-medium  pr-1 pl-1 text-blue-700">{productCount}</span>
            </h1>
            <div className="flex justify-center mt-2">
                <Table columns={columns} data={filteredData}/>
            </div>

        </div>
    );
}

export default FilterableTable;