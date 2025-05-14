import React, { useState } from 'react';
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { useRouter } from "next/navigation";

function SearchCodeProduct({ userId }) {
    const [searchCode, setSearchCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const router = useRouter();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault(); // Prevents the default form submit behavior

        setError(null);  // Clear previous errors

        if (!searchCode || !userId) {
            setError("Please enter a code and ensure you are logged in.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/products/check-product?userId=${userId}&code=${searchCode}`);
            if (response.ok) {
                const product = await response.json();

                if (product && product.status === 'deleted') {
                    setSearchResult(null);
                    setError("Produit Supprimé"); // Set the error message for deleted product
                } else if (product && product.status !== 'Sold') {
                    router.push(`/jewelry/lend/${product.code}`);
                } else {
                    setSearchResult(null);
                    setError("Produit non trouvé ou Déjà vendu");
                }
            } else {
                setSearchResult(null);
                setError("Produit non trouvé ou Déjà vendu");
            }
        } catch (error) {
            console.error('Error checking product:', error);
            setError('An error occurred while searching.');
        } finally {
            setLoading(false); // Ensure loading is always reset
        }
    };

    return (
        <div className="max-w-md mx-auto w-full min-w-72">
            <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>

                <input
                    type="search"
                    id="search"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="block w-full p-4 ps-10 peer h-full outline-none text-sm pr-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-700 focus:border-blue-700"
                    placeholder="Entrer le code du bijou..."
                    required
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    className="text-white absolute end-2.5 bottom-2.5 bg-gray-800 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    ) : (
                        <MdOutlineArrowForwardIos />
                    )}
                </button>
            </div>

            {error && (
                <div className="mt-1 p-2 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                    <span className="font-medium">{error}</span>
                </div>
            )}
        </div>
    );
}

export default SearchCodeProduct;