// Add this code in a useEffect hook in your main component or a layout component
"use client"
import {useEffect} from 'react';
import {signOut} from 'next-auth/react';

const useSignOutOnClose = () => {
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Sign out the user when the window/tab is closed
            signOut({redirect: false});
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
};

export default useSignOutOnClose;
