import React from 'react';
import Header from "@/components/bids/header/header";
import AddProduct from "@/components/jewelry/products/addProduct";

function Page() {
    return (
        <>
            <Header title="Ajouter un Produit "/>
            <AddProduct/>
        </>

    );
}

export default Page;