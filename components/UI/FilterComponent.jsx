import React from 'react';

function FilterComponent({
                             types,
                             provenance,
                             carat,
                             statuses,
                             selectedState,
                             selectedModel,
                             selectedOrigin,
                             selectedCarat,
                             selectedStatus,
                             handleCheckboxChange,
                             setSelectedModel,
                             setSelectedOrigin,
                             setSelectedCarat,
                             setSelectedStatus,
                             productCount,
                             totalWeight,
                             setSelectedState,
                             startDate,
                             setStartDate,
                             endDate,
                             setEndDate,
                         }) {
    return (
        <div>
            <div className="mt-4">
                <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Modèle</h1>
                <div className="flex flex-wrap gap-2">
                    {types.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700 ${selectedModel.includes(item.name) ? 'text-white bg-blue-700 ' : 'text-blue-700 '}`}
                            onClick={() => handleCheckboxChange(setSelectedModel, item.name)}
                        >
                            <span>{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-10 mt-2 justify-start flex-wrap">
                <div className="mt-2">
                    <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Provenance</h1>
                    <div className="flex flex-wrap gap-2">
                        {provenance.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg  border border-blue-700  ${selectedOrigin.includes(item.name) ? 'text-white bg-blue-700 ' : 'text-blue-700  '}`}
                                onClick={() => handleCheckboxChange(setSelectedOrigin, item.name)}
                            >
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-2">
                    <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Carat</h1>
                    <div className="flex flex-wrap gap-2">
                        {carat.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700  ${selectedCarat.includes(item.value) ? 'text-white bg-blue-700 ' : 'text-blue-700  '}`}
                                onClick={() => handleCheckboxChange(setSelectedCarat, item.value)}
                            >
                                <span>{item.value}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {statuses && <div className="mt-2">
                    {statuses.length === 2 ?
                        <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">État
                            de la commande</h1> :
                        <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">État
                            du Produit</h1>}
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg  border border-blue-700 ${selectedStatus.includes(item.value) ?
                                    'text-white bg-blue-700 ' : 'text-blue-700  '}`}
                                onClick={() => handleCheckboxChange(setSelectedStatus, item.value)}
                            >
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>}
                {selectedState && <div className="mt-2">
                    <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">État
                        du produit</h1>
                    <div className="flex flex-wrap gap-2">
                        {selectedState.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`text-sm px-3 py-2 font-medium rounded-lg  border border-blue-700 ${selectedState.includes(item.value) ? 'text-white bg-blue-700 ' : 'text-blue-700'}`}
                                onClick={() => handleCheckboxChange(setSelectedState, item.value)}
                            >
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>}
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
                <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Nombre
                    total de produits: <span
                        className="font-medium  pr-1 pl-1 text-blue-700">{productCount}</span>
                </h1>
                <h1 className="font-light leading-none tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">Poids
                    total: <span
                        className="border-blue-800 font-medium  pr-1 pl-1 text-blue-700">{totalWeight} g</span>
                </h1>
            </div>
        </div>
    );
}

export default FilterComponent;
