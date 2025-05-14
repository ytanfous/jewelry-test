import React, { useEffect, useState } from 'react';
import Modal from "@/components/bids/UI/Modal";
import { useSession } from "next-auth/react";
import Facilitated from "@/components/jewelry/guarantee/facilitated/Facilitated";

function ModalGuaranteeUpdate({
                                  modalUpdateIsOpen,
                                  handleStopUpdate,
                                  guarantees,
                                  selectedGuaranteeId
                              }) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const { data: session } = useSession();
    const [formErrors, setFormErrors] = useState({});
    const [selectedComponent, setSelectedComponent] = useState('');
    const [updatedPrice, setUpdatedPrice] = useState('');
    const [updatedAdvance, setUpdatedAdvance] = useState(null);
    const [updatedMonths, setUpdatedMonths] = useState(null);
    const [updatedNote, setUpdatedNote] = useState(null);
    const [updatedTableData, setUpdatedTableData] = useState([]);
    const [updatedPhone, setUpdatedPhone] = useState('');
    const [updatedName, setUpdatedName] = useState('');
    const [updatedStatus, setUpdatedStatus] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isUpdateTable, setsUpdateTable] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);



    useEffect(() => {
        if (selectedGuaranteeId) {
            const selected = guarantees.find(s => s.id === selectedGuaranteeId);
            if (selected) {
                // Format the dates in tableData if they exist
                const formattedTableData = selected.tableData?.map(row => ({
                    ...row,
                    date: row.date ? new Date(row.date).toISOString().split('T')[0] : '', // Format the date
                })) || [];

                setUpdatedName(selected.name);
                setUpdatedPrice(selected.price);
                setUpdatedMonths(selected.months);
                setUpdatedAdvance(selected.advance);
                setUpdatedTableData(formattedTableData); // Use the formatted table data
                setUpdatedPhone(selected.phone);
                setUpdatedNote(selected.note);
                setSelectedComponent(selected.selectedComponent);
                setsUpdateTable(false);
                setUpdatedStatus(selected.rows?.[0]?.status );
                setIsInitialLoad(false); // Mark initial load as complete
            }
        }
    }, [selectedGuaranteeId, guarantees]);
    useEffect(() => {
        if (!isInitialLoad && updatedPrice && updatedAdvance && updatedMonths) {
            generateTable(updatedMonths);
            setsUpdateTable(true);

        }


    }, [updatedPrice, updatedAdvance, updatedMonths]);



    const generateTable = (months) => {


        if(isUpdateTable) {
            const remainingAmount = updatedPrice - updatedAdvance;
            const initialAmount = remainingAmount / months;

            const today = new Date();
            const data = Array.from({ length: months }, (_, index) => {
                const date = new Date(today);
                date.setMonth(today.getMonth() + index + 1);

                return {
                    date: date.toISOString().split('T')[0],
                    checkNumber: '',
                    amount: initialAmount,
                    status: false,
                };
            });

            setUpdatedTableData(data);
        }


    };

    const handleMonthsChange = (e) => {
        const value = Number(e.target.value);
        setUpdatedMonths(value);
    };

    const handleTableChange = (index, field, value) => {
        const updatedTableData2 = [...updatedTableData];
        if (field === 'date') {
            // Ensure the date is in yyyy-MM-dd format
            updatedTableData2[index][field] = new Date(value).toISOString().split('T')[0];
        } else {
            updatedTableData2[index][field] = value;
        }

        if (field === 'amount' && index < updatedTableData2.length - 1) {
            const newAmount = Number(value);
            updatedTableData2[index].amount = newAmount;

            let remainingAmount = updatedPrice - updatedAdvance;

            for (let i = 0; i < updatedTableData2.length; i++) {
                if (i === index) {
                    updatedTableData2[i].amount = newAmount;
                } else if (i > index) {
                    remainingAmount -= updatedTableData2[i - 1].amount;
                    updatedTableData2[i].amount = Math.max(remainingAmount);
                } else {
                    updatedTableData2[i].amount = updatedTableData2[i].amount || 0;
                    remainingAmount -= updatedTableData2[i].amount;
                }
            }
        }

        setUpdatedTableData(updatedTableData2);
    };

    function handleCheckboxChange(value) {
        if (value === selectedSection) {
            setSelectedSection(null);
        } else {
            setSelectedSection(value);
        }
    }

    async function handleUpdate(id) {
        try {
            setLoading(true);

            const passwordCheckResponse = await fetch('/api/auth/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    password: password,
                }),
            });

            const passwordCheckResult = await passwordCheckResponse.json();

            if (!passwordCheckResponse.ok || !passwordCheckResult.success) {
                setLoading(false);
                throw new Error('Mot de passe incorrect');
            }

            const response = await fetch(`/api/guarantee/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    price: updatedPrice,
                    months: updatedMonths,
                    tableData: updatedTableData,
                    advance: updatedAdvance,
                    note: updatedNote,
                    name: updatedName,
                    phone: updatedPhone,
                    selectedComponent: selectedComponent,
                    selectedSection: selectedSection
                }),
            });

            if (response.ok) {
                handleStopUpdate();
                setIsInitialLoad(true);
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
                window.location.reload();
                setPassword(null);
                setLoading(false);
            }

        } catch (error) {
            console.error('Error updating amount:', error);
            setLoading(false);
            setConfirmError(error.message);
        }
    }

    return (
        <Modal open={modalUpdateIsOpen} onClose={()=> {
            setIsInitialLoad(true);
            handleStopUpdate();
        }}>
            <div className="relative bg-white rounded-lg shadow">
                <button
                    type="button"
                    onClick={() => {
                        setIsInitialLoad(true);
                        handleStopUpdate();
                    }}
                    className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                    data-modal-hide="popup-modal"
                >
                    <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
                <div className="p-4 md:p-5 text-center">
                    <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>
                    <h3 className="mb-5 text-lg font-normal text-gray-500">
                        Voulez-vous vraiment modifier facilité ?
                    </h3>
                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="name" className="text-lg font-normal text-start mr-3 text-gray-500 pr-2 w-24">
                            Nom:
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={updatedName || ""}
                            placeholder="Nom et prénom ..."
                            onChange={(e) => setUpdatedName(e.target.value)}
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                        />
                    </div>

                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="phone" className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                            Téléphone:
                        </label>
                        <input
                            type="text"
                            id="phone"
                            value={updatedPhone || ""}
                            placeholder="Numéro de téléphone ..."
                            onChange={(e) => setUpdatedPhone(e.target.value)}
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                        />
                    </div>
                    <div className="mb-4 flex items-center justify-start">
                        <label htmlFor="advance"
                               className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                            Montant:
                        </label>
                        <input
                            type="number"
                            id="advance"
                            value={updatedPrice || ""}
                            placeholder="Montant ..."
                            onChange={(e) => setUpdatedPrice(e.target.value)}
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                        />
                    </div>
                    <div className="mb-4 flex items-start justify-start">
                        <label htmlFor="note"
                               className="text-lg font-normal text-start mr-3   text-gray-500 pr-2 w-24">Note:</label>
                        <textarea
                            id="note"
                            rows="5"
                            value={updatedNote || ""}
                            placeholder="note ..."
                            onChange={(e) => setUpdatedNote(e.target.value)}
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2 resize-none"
                        />
                    </div>
                    {selectedComponent === "Facilitated" && <>
                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="advance"
                                   className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                                Avance:
                            </label>
                            <input
                                type="number"
                                id="advance"
                                value={updatedAdvance || ""}
                                placeholder="Montant ..."
                                onChange={(e) => setUpdatedAdvance(Number(e.target.value))}
                                className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                            />
                        </div>
                        {updatedStatus === 'Facilité'  &&
                            <div className="mb-4 flex items-center justify-start">
                                <label htmlFor="advance"
                                       className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                                    Avance:
                                </label>
                                <button
                                    type="button"
                                    className={`text-sm px-3 py-2 font-medium rounded-lg border border-blue-700  ${ selectedSection === "Crédit" ? 'text-white bg-blue-700 ' : 'text-blue-700   '}`}
                                    onClick={() => handleCheckboxChange("Crédit")}
                                >
                                    <span>Crédit</span>
                                </button>
                            </div>}



                        <div className="mb-4 flex items-center justify-start">
                            <label htmlFor="months"
                                   className="text-lg font-normal text-start mr-3  text-gray-500 pr-2 w-24">
                                Mois:
                            </label>
                            <input
                                type="number"
                                id="months"
                                value={updatedMonths || ""}
                                placeholder="Mois ..."
                                onChange={(e) => handleMonthsChange(e)}
                                className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md ml-2"
                            />
                        </div>
                        <table className="w-full table-auto divide-y divide-gray-200">
                            <thead>
                            <tr>
                                <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Montant</th>
                                <th className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">État</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {
                                updatedTableData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                            <input
                                                type="date"
                                                value={row.date} // Ensure the date is in yyyy-MM-dd format
                                                onChange={(e) => handleTableChange(index, 'date', e.target.value)}
                                                className="max-w-40 rounded-md border-2 border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1]"
                                            />
                                            {formErrors[`tableData-${index}-date`] && (
                                                <div className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                                    <p>{formErrors[`tableData-${index}-date`]}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                            <input
                                                type="number"
                                                value={row.amount}
                                                onChange={(e) => handleTableChange(index, 'amount', e.target.value)}
                                                disabled={index === updatedTableData.length - 1}
                                                className="max-w-28 rounded-md border-2 border-[#e0e0e0] bg-white disabled:bg-blue-50 py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1]"
                                            />
                                            {formErrors[`tableData-${index}-amount`] && (
                                                <div className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                                    <p>{formErrors[`tableData-${index}-amount`]}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                            <input
                                                id="inline-checkbox"
                                                type="checkbox"
                                                checked={row.checkNumber.toLowerCase() === "paid"}
                                                onChange={(e) => {
                                                    const table = [...updatedTableData];
                                                    table[index].checkNumber = e.target.checked ? "Paid" : "Pending";
                                                    table[index].status = e.target.checked;
                                                    setUpdatedTableData(table);
                                                }}
                                                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer focus:ring-2"
                                            />
                                            {formErrors[`tableData-${index}-amount`] && (
                                                <div className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                                                    <p>{formErrors[`tableData-${index}-status`]}</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </>}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-4 p-2 border-2 min-w-20 rounded w-full outline-none focus-within:border-blue-700 focus:ring-blue-500"
                    />

                    {confirmError && (
                        <div
                            className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 mb-2 p-1 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                 fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p className="text-center">{confirmError}</p>
                        </div>
                    )}

                    <button
                        data-modal-hide="popup-modal"
                        type="submit"
                        onClick={() => handleUpdate(selectedGuaranteeId)}
                        disabled={loading}
                        className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                    >
                        Oui, je suis sûr
                    </button>
                    <button
                        data-modal-hide="popup-modal"

                        type="button"
                        onClick={() => {
                            setIsInitialLoad(true);
                            handleStopUpdate();
                        }}

                        className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                    >
                        No, Annuler
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ModalGuaranteeUpdate;