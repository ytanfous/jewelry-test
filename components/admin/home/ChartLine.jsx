// components/ChartLine.js
import React from "react";
import { TEChart } from "tw-elements-react";
import { useProductAndAuctionCreationDates } from "@/app/hooks/useProductAndAuctionCreationDates";

const ChartLine = () => {
    const { labels, productCount, auctionCount, loading, error } = useProductAndAuctionCreationDates();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading chart data: {error.message}</div>;

    return (
        <div className="w-full mt-5 shadow-md relative flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border p-4">

            <TEChart
                type="line"
                data={{
                    labels: labels,
                    datasets: [
                        {
                            label: "Nombre de produits par jour",
                            data: productCount,
                            borderColor: 'rgba(0, 255, 0, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        },
                        {
                            label: "Nombre d'enchères par jour",
                            data: auctionCount,
                            borderColor: 'rgba(0, 0, 255, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        },
                    ],
                }}
            />
        </div>
    );
};

export default ChartLine;
