"use client"
import React, {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import Header from "@/components/bids/header/header";
import TypeSelector from "@/components/jewelry/products/TypeSelector";
import Calculator from "@/components/jewelry/products/Calculator";

import {useFeatures} from "@/app/hooks/featuresApi";
import LoadingPage from "@/components/UI/LoadingPage";

function Page({params}) {
    const {slugWeslet} = params;
    const [jewelers, setJewelers] = useState(null);
    const [loadings, setLoadings] = useState(true);
    const {data: session} = useSession();
    const [userId, setUserId] = useState(null);
    const {types, provenance, carat, loading} = useFeatures();
    const [calculatorValue, setCalculatorValue] = useState('0');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedType, setSelectedType] = useState({
        types: null, provenance: null, carat: null, weight: null,
    });

    function handleTypeSelect(field, value) {
        setSelectedType({
            ...selectedType, [field]: value,
        });
    }



    useEffect(() => {
        if (session && session.user) {
            setUserId(session.user.id);
        }

    }, [session]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoadings(true);
                const response = await fetch(`/api/jewelers/${slugWeslet}`);
                if (response.ok) {
                    const data = await response.json();
                    setJewelers(data);
                } else {
                    console.error('Failed to fetch Jewelers');
                }
            } catch (error) {
                console.error('Error fetching Jewelers:', error);
            } finally {
                setLoadings(false);
            }
        }

        if (userId) {
            fetchData();
        }
    }, [userId,slugWeslet]);

    async function handleModalSubmit() {
        setIsSubmitting(true);


        let adjustedWeight = calculatorValue;
        if (calculatorValue.endsWith('.')) {
            adjustedWeight += '0';
        }

        const productData = {
            userId: session.user.id,
            model: selectedType.types,
            origin: selectedType.provenance,
            carat: selectedType.carat,
            weight: adjustedWeight,
            jewelerId:slugWeslet
        };

        try {
            const response = await fetch('/api/products/createWeslet', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify(productData),
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.redirect;
            } else {
                const errorData = await response.json();
                console.error('Error creating product:', errorData);
            }
        } catch (error) {
            console.error('Error creating product:', error);
        }
    }

    if (loading) {
        return <LoadingPage/>;
    }

    return (
        <>
            <Header title={`WESLET ${jewelers?.name}`}/>
            <div className="flex flex-wrap justify-around flex-col">
                <div className="flex flex-wrap flex-row gap-1">
                    <div className="max-w-80 mx-auto m-2">
                        <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Modèle</h1>

                        <TypeSelector types={types}
                                      onSelect={(value) => handleTypeSelect('types', value ? value.name : null)}/>
                    </div>
                    <div className="flex flex-col items-center max-w-24 mx-auto m-2">
                        <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Provenance</h1>
                        <TypeSelector types={provenance}
                                      onSelect={(value) => handleTypeSelect('provenance', value ? value.name : null)}/>
                    </div>

                    <div className="flex flex-col items-center max-w-24 mx-auto m-2">
                        <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Carat</h1>
                        <TypeSelector types={carat}
                                      onSelect={(value) => handleTypeSelect('carat', value ? value.value : null)}/>
                    </div>

                    <div className="flex flex-col max-w-96 mx-auto m-2">
                        <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Poids</h1>
                        <Calculator value={calculatorValue} onChange={setCalculatorValue}/>
                    </div>
                </div>
                <div className="flex m-2 flex-wrap gap-2 justify-end">


                    <button
                        type="submit"
                        className={`hover:shadow-form rounded-md max-w-36 py-3 px-8 text-base font-semibold text-white mb-1 mt-1 outline-none ${isSubmitting ? 'bg-gray-500' : 'bg-blue-700 hover:bg-blue-800'}`}
                        onClick={handleModalSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Chargement...' : 'Valider'}
                    </button>
                </div>

            </div>
        </>
    );
}

export default Page;