import { useEffect, useState } from "react";

export const useProductAndAuctionCreationDates = () => {
    const [labels, setLabels] = useState([]);
    const [productCount, setProductCount] = useState([]);
    const [auctionCount, setAuctionCount] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCreationDates = async () => {
            try {
                const response = await fetch('/api/admin/creationDates');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setLabels(data.labels);
                setProductCount(data.productCount);
                setAuctionCount(data.auctionCount);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCreationDates();
    }, []);

    return { labels, productCount, auctionCount, loading, error };
};
