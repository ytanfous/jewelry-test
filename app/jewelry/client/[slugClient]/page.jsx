import React from 'react';
import Header from "@/components/bids/header/header";
import Detail from "@/components/jewelry/client/Detail";

function Page({params}) {
    const {slugClient} = params;


    return (
        <>
            <Header title="Détail du Client"/>
            <Detail id={slugClient}/>
        </>
    );
}

export default Page;