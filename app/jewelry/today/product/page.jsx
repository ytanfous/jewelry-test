import React from 'react';
import Header from "@/components/bids/header/header";
import {useSession} from "next-auth/react";
import DetailsLyoum from "@/components/jewelry/products/DetailsLyoum";

function Page() {

    return (
        <>
            <Header title="Lyoum Produits" />
            <DetailsLyoum  />

        </>
    );
}

export default Page;