"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { motion } from "framer-motion";

function DetailsLyoum() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const [expanded, setExpanded] = useState({});
    const [filterId, setFilterId] = useState("");
    const productCount = useMemo(() => {
        const uniqueJewelerIds = new Set(history.map(item => item.jeweler.id));
        return uniqueJewelerIds.size;
    }, [history]);

    useEffect(() => {
        async function fetchData() {
            if (session?.user?.id) {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/products/getHistory?userId=${session.user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setHistory(data);
                    } else {
                        console.error("Failed to fetch history data");
                    }
                } catch (error) {
                    console.error("Error fetching history data:", error);
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchData();
    }, [session]);

    const groupedHistory = useMemo(() => {
        return history.reduce((acc, item) => {
            const jewelerId = item.jeweler.id;
            if (!acc[jewelerId]) {
                acc[jewelerId] = {
                    jeweler: item.jeweler,
                    products: [],
                    totals: { Retourné: 0, Prêté: 0, Vendu: 0, SLAF: 0 },
                };
            }
            acc[jewelerId].products.push(item);

            if (item.status === "Active") acc[jewelerId].totals.Retourné++;
            if (item.status === "Lend") acc[jewelerId].totals.Prêté++;
            if (item.status === "Sold") acc[jewelerId].totals.Vendu++;
            if (item.status === "SLAF") acc[jewelerId].totals.SLAF++;

            return acc;
        }, {});
    }, [history]);

    const toggleExpand = (jewelerId) => {
        setExpanded((prev) => ({ ...prev, [jewelerId]: !prev[jewelerId] }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getFullYear()} à ${date
            .getHours()
            .toString()
            .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

    const totalStatusCount = useMemo(() => {
        const { Retourné, Prêté, Vendu, SLAF } = Object.values(groupedHistory).reduce(
            (acc, group) => {
                acc.Retourné += group.totals.Retourné;
                acc.Prêté += group.totals.Prêté;
                acc.Vendu += group.totals.Vendu;
                acc.SLAF += group.totals.SLAF;
                return acc;
            },
            { Retourné: 0, Prêté: 0, Vendu: 0, SLAF: 0 }
        );
        return { Retourné, Prêté, Vendu, SLAF };
    }, [groupedHistory]);

    return (
        <div className="container mx-auto p-2">
            {/* Search Input */}
            <div className="max-w-md mx-auto m-2">
                <div className="relative flex items-center w-full h-12 border border-gray-200 rounded-lg shadow focus-within:border-blue-700 focus-within:border-2 bg-white overflow-hidden">
                    <div className="grid place-items-center h-full w-12 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                        type="text"
                        id="search"
                        placeholder="Rechercher par nom du bijoutier..."
                        value={filterId}
                        onChange={(e) => setFilterId(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex items-center align-middle justify-center">
                <h1 className="font-light leading-none tracking-tight mt-4 text-gray-900 text-2xl border-b-2 pb-2 mb-2">
                    Le total des bijoutiers: <span className="border-blue-800 font-medium pr-1 pl-1 text-blue-700">{productCount}</span>
                </h1>
            </div>
            <div className="flex gap-3 justify-center">
                {Object.entries(totalStatusCount).map(([key, value]) =>
                    value > 0 ? (
                        <h2 key={key} className="font-light leading-none tracking-tight mt-4 text-gray-900 text-2xl border-b-2 pb-2 mb-2">
                            {key}: <span className="border-blue-800 font-medium pr-1 pl-1 text-blue-700">{value}</span>
                        </h2>
                    ) : null
                )}
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="lg:w-2/3 sm:w-full mx-auto mt-5 space-y-4">
                    {Object.entries(groupedHistory)
                        .filter(([_, group]) => !filterId || group.jeweler.name.toLowerCase().includes(filterId.toLowerCase()))
                        .map(([jewelerId, group]) => {
                            const { Retourné, Prêté, Vendu, SLAF } = group.totals;
                            return (
                                <div key={jewelerId} className="mb-4 border rounded-lg p-4">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(jewelerId)}>
                                        <h2 className="text-lg font-semibold">
                                            {group.jeweler.name} {group.jeweler.storeName ? <> - {group.jeweler.storeName}</> : ""}
                                        </h2>
                                        <span className="text-blue-500 text-xl">
                                            {expanded[jewelerId] ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        {Retourné > 0 && (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400">
                                                Retourné: {Retourné}
                                            </span>
                                        )}
                                        {Prêté > 0 && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-300">
                                                Prêté: {Prêté}
                                            </span>
                                        )}
                                        {Vendu > 0 && (
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded border border-indigo-400">
                                                Vendu: {Vendu}
                                            </span>
                                        )}
                                        {SLAF > 0 && (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400">
                                                SLAF: {SLAF}
                                            </span>
                                        )}
                                    </div>

                                    {expanded[jewelerId] && (
                                        <motion.div
/*                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}*/
                                            className="overflow-x-auto " // Add this line
                                        >
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead>
                                                <tr>
                                                    <th scope="col" className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Code</th>
                                                    <th scope="col" className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Carat</th>
                                                    <th scope="col" className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Poids</th>
                                                    <th scope="col" className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Provenance</th>
                                                    <th scope="col" className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Modèle</th>
                                                    <th scope="col" className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    <th scope="col" className="px-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                {group.products.map((row, index) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.code}</td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.carat || "-"}</td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.weight || "-"}</td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.origin || "-"}</td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.product.model || "-"}</td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(row.date)}</td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-end flex justify-start gap-1 flex-row">
                                                            {row.status === "Active" && (
                                                                <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-green-400">Retourné</span>
                                                            )}
                                                            {row.status === 'Lend' && (
                                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-yellow-300">Prêter</span>
                                                            )}
                                                            {row.status === 'Sold' && (
                                                                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-indigo-400">Vendu</span>
                                                            )}
                                                            {row.status === 'SLAF' && (
                                                                <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-green-400">SLAF</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}

export default DetailsLyoum;