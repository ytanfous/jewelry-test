import React from 'react';
import Header from "@/components/bids/header/header";
import AddOrder from "@/components/jewelry/orders/AddOrder";
import UpdateUser from "@/components/jewelry/updateUser/UpdateUser";

function Page() {
    return (
        <>
            <Header title="Mise à jour Utilisateur"/>
            <UpdateUser/>
        </>
    );
}

export default Page;