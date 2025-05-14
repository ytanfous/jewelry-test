import React, {useState, useEffect} from 'react';

function Facilitated({
                         price,
                         advance,
                         months,
                         handlePriceChange,
                         handleAdvanceChange,
                         handleMonthsChange,
                         tableData,
                         handleTableChange,
                         formErrors,
                         selectedSection,
                         setSelectedSection,
                     }) {

    return (
        <div className="mx-auto w-full max-w-[550px] bg-white mt-2 border  border-white shadow p-4 rounded-3xl">
            <div className="mb-5">
                {/* Titre pour les boutons */}
                <label htmlFor="price" className="mb-3 block text-base font-medium text-[#07074D]">
                    Choisissez une option :
                </label>
                {/* Boutons */}
                <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-semibold ${selectedSection === "Facilité" ? "bg-blue-700 text-white" : "bg-gray-200"}`}
                    onClick={() => setSelectedSection(selectedSection === "Facilité" ? null : "Facilité")} // Toggle entre "Facilité" et null
                >
                    Facilité
                </button>
                <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-semibold ml-1 ${selectedSection === "Crédit" ? "bg-blue-700 text-white" : "bg-gray-200"}`}
                    onClick={() => setSelectedSection(selectedSection === "Crédit" ? null : "Crédit")} // Toggle entre "Crédit" et null
                >
                    Crédit
                </button>
            </div>
            <div className="mb-5">
                <label htmlFor="price" className="mb-3 block text-base font-medium text-[#07074D]">
                    Montant à payer :
                </label>
                <input
                    type="number"
                    name="price"
                    id="price"
                    placeholder="prix..."
                    value={price}
                    onChange={handlePriceChange}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
                {formErrors.price && (
                    <div className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none"
                             viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p>{formErrors.price}</p>
                    </div>
                )}
            </div>
            <div className="mb-5">
                <label htmlFor="advance" className="mb-3 block text-base font-medium text-[#07074D]">
                    Avance :
                </label>
                <input
                    type="number"
                    name="advance"
                    id="advance"
                    placeholder="prix..."
                    value={advance}
                    onChange={handleAdvanceChange}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
                {formErrors.advance && (
                    <div className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none"
                             viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p>{formErrors.advance}</p>
                    </div>
                )}
            </div>
            <div className="mb-5">
                <label htmlFor="months" className="mb-3 block text-base font-medium text-[#07074D]">
                    Nombre de mois pour le paiment :
                </label>
                <input
                    type="number"
                    name="months"
                    id="months"
                    placeholder="prix..."
                    value={months}
                    onChange={handleMonthsChange}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
                {formErrors.months && (
                    <div className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none"
                             viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p>{formErrors.months}</p>
                    </div>
                )}
            </div>
            {tableData.length > 0 && (
                <table className="w-full table-auto divide-y divide-gray-200">
                    <thead>
                    <tr>
                        <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
                        {/*                        <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Numéro de
                            Chèque
                        </th>*/}
                        <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Montant</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {tableData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-100">
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                <input
                                    type="date"
                                    value={row.date}
                                    onChange={(e) => handleTableChange(index, 'date', e.target.value)}
                                    className="max-w-40 rounded-md border-2 border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1]"
                                />
                                {formErrors[`tableData-${index}-date`] && (
                                    <div
                                        className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                        <p>{formErrors[`tableData-${index}-date`]}</p>
                                    </div>
                                )}
                            </td>
                            {/*                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                <input
                                    type="text"
                                    value={row.checkNumber}
                                    onChange={(e) => handleTableChange(index, 'checkNumber', e.target.value)}
                                    className="max-w-32 rounded-md border-2 border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1]"
                                />
                                {formErrors[`tableData-${index}-checkNumber`] && (
                                    <div
                                        className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                        <p>{formErrors[`tableData-${index}-checkNumber`]}</p>
                                    </div>
                                )}
                            </td>*/}
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                <input
                                    type="number"
                                    value={row.amount}
                                    onChange={(e) => handleTableChange(index, 'amount', e.target.value)}
                                    disabled={index === tableData.length - 1}
                                    className="max-w-28 rounded-md border-2 border-[#e0e0e0] bg-white disabled:bg-blue-50 py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1]"
                                />
                                {formErrors[`tableData-${index}-amount`] && (
                                    <div
                                        className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                        <p>{formErrors[`tableData-${index}-amount`]}</p>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Facilitated;
