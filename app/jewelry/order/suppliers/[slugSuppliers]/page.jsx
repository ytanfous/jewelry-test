import React from 'react';
import Header from "@/components/bids/header/header";
import Details from "@/components/jewelry/suppliers/Details";

function Page({params}) {
    const {slugSuppliers} = params;

    return (
        <>
            <Header title="Détail du Fournisseur"/>
            <Details id={slugSuppliers}/>

        </>

    );
}

export default Page;