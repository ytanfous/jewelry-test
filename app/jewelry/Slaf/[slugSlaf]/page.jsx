"use client"
import React, {useEffect, useState} from 'react';
import Header from "@/components/bids/header/header";
import AddSalf from "@/components/jewelry/Slaf/AddSalf";
import {useSession} from "next-auth/react";
import GetSalfJeweler from "@/components/jewelry/Slaf/GetSalfJeweler";
import Loading from "@/app/loading";

function Page({params}) {
    const {slugSlaf} = params;
    const [Jewelers, setJewelers] = useState(null);
    const [loading, setLoading] = useState(true);
    const {data: session} = useSession();
    const [userId, setUserId] = useState(null);
    useEffect(() => {
        if (session && session.user) {
            setUserId(session.user.id);
        }

    }, [session]);
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/jewelers/${slugSlaf}`);
                if (response.ok) {
                    const data = await response.json();
                    setJewelers(data);
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
    }, [userId,slugSlaf]);

    return (
        <>
            <Header title={`Ajouter une Slaf pour  ${Jewelers?.name}`}/>
            {Jewelers && userId ? (
                <>
                    <AddSalf userId={userId} jewelerId={Jewelers.id} />
                    <GetSalfJeweler userId={userId} jewelerId={Jewelers.id} />
                </>
            ) : (
                <Loading/>
            )}
        </>
    );
}

export default Page;