"use client"
import React, {useEffect, useState} from 'react';
import Header from "@/components/bids/header/header";
import {useSession} from "next-auth/react";
import DetailProduct from "@/components/jewelry/products/DetailProduct";
import Loading from "@/app/jewelry/lend/[slugLend]/loading";
import JewelerLend from "@/components/jewelry/products/JewelerLend";
import CardLend from "@/components/jewelry/products/CardLend";
import JewelerCard from "@/components/jewelry/products/JewelerCard";
import {useRouter} from "next/navigation";

function Page({params}) {
    const {slugLend} = params;
    const {data: session} = useSession();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        if (session && session.user) {
            setUserId(session.user.id);
        }

    }, [session]);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true); // Set loading to true before fetching
            try {

                const response = await fetch(
                    `/api/products/check-product?userId=${userId}&code=${slugLend}`
                );
                if (response.ok) {
                    const data = await response.json();
                    if (userId !== data.userId) {
                        router.push('/jewelry');
                        return;
                    }
                    setProduct(data);
                    setError(null);
                } else {
                    router.push('/jewelry');
                }
            } catch (err) {
                router.push('/jewelry');
                setError("An unexpected error occurred.");
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProduct();
        }
    }, [userId, slugLend]);

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <Header title={`Details du bijou - Code: ${slugLend}`}/>
            <DetailProduct product={product}/>
            {product?.status === 'Active' && <JewelerLend userId={userId} code={slugLend}  />}
            {product?.status !== 'Active' && <JewelerCard userId={userId} code={slugLend} jewelerId={product?.jewelerId} />}


        </>

    );
}

export default Page;