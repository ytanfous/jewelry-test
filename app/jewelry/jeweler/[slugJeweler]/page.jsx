import React from 'react';
import Header from "@/components/bids/header/header";
import Details from "@/components/jewelry/cards/details";

function Page({params}) {
    const {slugJeweler} = params;

    return (
        <>
            <Header title="Détail du bijoutier"/>
            <Details id={slugJeweler}/>

        </>

    );
}

export default Page;