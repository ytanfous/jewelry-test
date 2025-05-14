import React from 'react';
import Header from "@/components/bids/header/header";
import AddOrder from "@/components/jewelry/orders/AddOrder";
import CreateOrderSupplier from "@/components/jewelry/orders/AddSupplierOrder";

function Page() {
    return (
        <>
            <Header title="Ajouter une Commande Fournisseur"/>
            <CreateOrderSupplier/>
        </>
    );
}

export default Page;