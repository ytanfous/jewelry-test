import React, {useState, useMemo} from 'react';
import Table from "@/components/jewelry/products/table/Table";
import {useFeatures} from "@/app/hooks/featuresApi";
import LoadingPage from "@/components/UI/LoadingPage";
import FilterComponent from "@/components/UI/FilterComponent";
import GeneratePdfButton from "@/components/UI/GeneratePdfButton";


function FilterableTable({columns, data}) {
    const [searchText, setSearchText] = useState('');
    const [selectedModel, setSelectedModel] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState([]);
    const [selectedCarat, setSelectedCarat] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const {types, provenance, carat, loading} = useFeatures();
    const normalizeDate = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };
    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Exact match for code
            const matchesSearchText = searchText ? item.code.toLowerCase() === searchText.toLowerCase() : true;

            const matchesModel = selectedModel.length ? selectedModel.includes(item.model) : true;
            const matchesOrigin = selectedOrigin.length ? selectedOrigin.includes(item.origin) : true;
            const matchesCarat = selectedCarat.length ? selectedCarat.includes(item.carat) : true;
            const matchesStatus = selectedStatus.length ? selectedStatus.includes(item.status) : true;

            const itemDate = normalizeDate(item.updatedAt);
            const start = startDate ? normalizeDate(startDate) : null;
            const end = endDate ? normalizeDate(endDate) : null;
            const matchesDateRange = (!start || itemDate >= start) && (!end || itemDate <= end);

            const excludeWesletStatus = item.status !== "WESLET";

            return matchesSearchText && matchesModel && matchesOrigin && matchesCarat && matchesStatus && matchesDateRange && excludeWesletStatus;
        });
    }, [data, searchText, selectedModel, selectedOrigin, selectedCarat, selectedStatus, startDate, endDate]);


    const productCount = useMemo(() => filteredData.length, [filteredData]);
    const totalWeight = useMemo(() => {
        return filteredData.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0).toFixed(2);
    }, [filteredData]);


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

    if (loading) {
        return <LoadingPage/>;
    }
    const pdfColumns = {
        'code': 'Code',
        'model': 'Modèle',
        'origin': 'PR',
        'carat': 'Carat',
        'weight': 'Poids (g)',
        'status': 'État',
        'affectation': 'Affectation',

        'createdAt': 'Date Création',
        'updatedAt': 'Date modifier',
    };

    return (<div>
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
                    // Format affectation similar to your table cell
                    affectation: item.status !== "deleted"
                        ? (item.Jeweler?.name || item.Guarantee?.formattedGuaranteeId || '-')
                        : '-'
                }))}
                columnsConfig={pdfColumns}
                title="Liste des Produits"
            />
        </div>

        <FilterComponent
            types={types}
            provenance={provenance}
            carat={carat}
            selectedModel={selectedModel}
            selectedOrigin={selectedOrigin}
            selectedCarat={selectedCarat}
            handleCheckboxChange={handleCheckboxChange}
            setSelectedModel={setSelectedModel}
            setSelectedOrigin={setSelectedOrigin}
            setSelectedCarat={setSelectedCarat}
            productCount={productCount}
            totalWeight={totalWeight}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            statuses={[{value: "Active", label: 'Disponible'}, {value: "Sold", label: 'Vendu'}, {
                value: "Lend",
                label: 'Prêter'
            }, {
                value: "Facilité",
                label: 'Facilité'
            },{
                value: "Crédit",
                label: 'Crédit'
            },{
                value: "deleted",
                label: 'Supprimé'
            }/*{value: "WESLET", label: 'WESLET'}*/]}
        />


        <div className="flex justify-center mt-2">
            <Table columns={columns} data={filteredData} size={10}/>
        </div>
    </div>);
}

export default FilterableTable;

