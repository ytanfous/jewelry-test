import React from 'react';
import Header from "@/components/bids/header/header";
import {useSession} from "next-auth/react";
import DetailsLyoum from "@/components/jewelry/Slaf/DetailsLyoum";

function Page() {

    return (
        <>
            <Header title="Lyoum Slaf" />
            <DetailsLyoum  />

        </>
    );
}

export default Page;