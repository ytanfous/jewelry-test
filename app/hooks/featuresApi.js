import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

let cachedData = null;

const fetchData = async (userId) => {
    try {
        const queryParam = userId ? `?userId=${userId}` : '';
        const [typesResponse, provenanceResponse, caratResponse] = await Promise.all([
            fetch(`/api/features/types${queryParam}`),
            fetch('/api/features/provenance'),
            fetch('/api/features/carat')
        ]);

        if (!typesResponse.ok || !provenanceResponse.ok || !caratResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        const [types, provenance, carat] = await Promise.all([
            typesResponse.json(),
            provenanceResponse.json(),
            caratResponse.json()
        ]);

        return { types, provenance, carat };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { types: [], provenance: [], carat: [] };
    }
};

export const useFeatures = () => {
    const { data: session } = useSession();
    const [features, setFeatures] = useState(cachedData);
    const [loading, setLoading] = useState(!cachedData);

    useEffect(() => {
        if (!cachedData) {
            const userId = session?.user?.id;
            fetchData(userId).then((data) => {
                cachedData = data;
                setFeatures(data);
                setLoading(false);
            });
        }
    }, [session]);

    return { ...features, loading };
};
