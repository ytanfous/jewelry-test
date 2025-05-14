import React, {useEffect, useState} from 'react';
import Loading from "@/app/jewelry/lend/[slugLend]/loading";
import Card from "@/components/jewelry/cards/Cards";
import CardLend from "@/components/jewelry/products/CardLend";

function JewelerLend({userId,code}) {
    const [Jewelers, setJewelers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    const handleClear = () => {
        setSearchText('');
    };



    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/jewelers/gets?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setJewelers(data.map(Jeweler => ({...Jeweler})));
                } else {
                    console.error('Failed to fetch Jewelers');
                }
            } catch (error) {
                console.error('Error fetching Jewelers:', error);
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            fetchData();
        }
    }, [userId]);

    const filteredCards = Jewelers.filter(Jeweler =>
        Jeweler.name.toLowerCase().includes(searchText.toLowerCase()) ||
        Jeweler.phone.includes(searchText)
    );

    if (loading) {
        return <Loading />;
    }


    return (
        <>
            <div className="max-w-md mx-auto m-4">
                <div
                    className="relative flex items-center w-full h-12 border border-gray-200 rounded-lg shadow focus-within:border-blue-700 focus-within:border-2 bg-white  overflow-hidden">
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
                        placeholder="Rechercher des bijoutier..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <div className="grid place-items-center h-full w-12 text-gray-300 cursor-pointer"
                             onClick={handleClear}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                    )}
                </div>
            </div>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-2">
                {filteredCards.map((jeweler) => (
                    <li key={jeweler.id} className="flex justify-center">
                        <CardLend {...jeweler} userId={userId} code={code}/>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default JewelerLend;