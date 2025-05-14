"use client"
import React from 'react';
import useAutoSignOut from "@/app/hooks/useAutoSignOut";
import Navbar from "@/components/jewelry/navbar/Navbar";
import Notification from "@/components/UI/Notification";
import NotificationPopup from "@/components/UI/NotificationPopup";

function Layout({children}) {
    useAutoSignOut();

    return (
        <>
            <Navbar/>
            <NotificationPopup/>


            <div className="m-4">
                {children}
            </div>
        </>
    );
}


export default Layout;