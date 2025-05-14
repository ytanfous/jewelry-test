import React from 'react';
import Header from "@/components/bids/header/header";
import AddOrder from "@/components/jewelry/orders/AddOrder";

function Page() {
    return (
        <>
            <Header title="Ajouter une Commande Client"/>
            <AddOrder/>
        </>
    );
}

export default Page;