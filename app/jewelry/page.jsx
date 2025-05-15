"use client";
import React, {useEffect, useState} from 'react';
import CardsGrid from "@/components/jewelry/cards/CardsGrid";
import Link from "next/link";
import LoadingPage from "@/components/UI/LoadingPage";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import SearchCodeProduct from "@/components/jewelry/products/SearchCodeProduct";
import ReceiveProductModal from "@/components/jewelry/products/ReceiveProductModal";
import GuaranteeProductModal from "@/components/jewelry/guarantee/GuaranteeProductModal";

function Page() {
    const [loading, setLoading] = useState(true);
    const [Jewelers, setJewelers] = useState([]);
    const {data: session} = useSession();
    const [searchCode, setSearchCode] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);
    const [modalIsOpenReceive, setModalIsOpenReceive] = useState(false);
    const [modalIsOpenGuarantee, setModalIsOpenGuarantee] = useState(false);

    const router = useRouter();
    useEffect(() => {
        if (session && session.user) {
            setUserId(session.user.id);
        }
    }, [session]);

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

    if (loading) {
        return (
            <LoadingPage/>
        );
    }

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
                if (product && product.status !== 'Sold') {
                    router.push(`/jewelry/lend/${product.code}`);
                } else {
                    setSearchResult(null);
                    setError("Produit non trouvé ou Déjà vendu");
                }
            } else {
                console.error('Failed to check product');
                setSearchResult(null);
                setError("Failed to check product. Please try again.");
            }
        } catch (error) {
            console.error('Error checking product:', error);
            setError('An error occurgray while searching.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
        }
    };

    const handleCloseModal = () => {
        setModalIsOpenReceive(false);
    };
    const handleOpenModalReceive = () => {
        setModalIsOpenReceive(true);
    };

    const handleCloseModalGuarantee = () => {
        setModalIsOpenGuarantee(false);
    };
    const handleOpenModalGuarantee = () => {
        setModalIsOpenGuarantee(true);
    };
    return (<>

        <div>
            <div className="flex justify-between flex-wrap border-amber-200  border-b-2 pb-4 gap-3 mb-4">
                <h1 className=" text-3xl font-light pl-2 leading-none md:text-start text-center tracking-tight text-gray-900 md:text-4xl ">Liste
                    des bijoutiers</h1>
                <div className="flex  flex-wrap lg:flex-nowrap   gap-2">
                    <div className="flex  flex-wrap lg:flex-nowrap items-center  gap-2">

                        <button
                            onClick={handleOpenModalReceive}
                            className="text-white bg-gray-800 hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 h-10 inline-flex
                             items-center justify-center whitespace-nowrap focus:outline-none font-medium rounded-lg text-sm px-6 py-2.5"
                        >
                            Récupérer
                        </button>
                        <button
                            onClick={handleOpenModalGuarantee}
                            className="text-white bg-gray-800 hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 h-10 inline-flex
                             items-center justify-center whitespace-nowrap focus:outline-none font-medium rounded-lg text-sm px-6 py-2.5"
                        >
                            {/*Garantie*/}
                            Vendre
                        </button>
                    </div>
                    <SearchCodeProduct userId={userId}/>
                    <div className="flex  flex-wrap lg:flex-nowrap items-center  gap-2">
                        <Link
                            href="jewelry/today/slaf"
                            className="text-white bg-gray-800 hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 h-10 inline-flex
                 items-center justify-center whitespace-nowrap focus:outline-none font-medium rounded-lg text-sm px-6 py-2.5"
                        >
                            Lyoum Slaf
                        </Link>
                        <Link
                            href="jewelry/today/product"
                            className="text-white bg-gray-800 hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 h-10  inline-flex
                 items-center justify-center whitespace-nowrap focus:outline-none font-medium rounded-lg text-sm px-6 py-2.5"
                        >
                            Lyoum Produit
                        </Link>


                    </div>
                </div>

            </div>

            <CardsGrid cards={Jewelers}/>
        </div>
        <ReceiveProductModal open={modalIsOpenReceive} onClose={handleCloseModal} session={session}/>
        <GuaranteeProductModal open={modalIsOpenGuarantee} onClose={handleCloseModalGuarantee} session={session}/>

    </>);
}

export default Page;