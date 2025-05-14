"use client";

import { useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';

function useAutoSignOut() {
    const { data: session } = useSession();

    // Function to start the sign-out timer if no user activity is detected
    const resetSignOutTimeout = useCallback(() => {
        if (session) {
            // Clear any existing sign-out timers
            clearTimeout(window.signOutTimeout);

            // Set a new timeout for 1 hour (60 minutes)
            window.signOutTimeout = setTimeout(() => {
                (async () => {
                    await signOut({ redirect: false });
                    window.location.href = '/';
                })();
            }, 60 * 1000 * 15);
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            // Set the initial timeout when the user logs in
            resetSignOutTimeout();

            // Reset the timeout on user activity (mousemove, keydown)
            const handleUserActivity = () => resetSignOutTimeout();

            // Add event listeners for user activity
            window.addEventListener('mousemove', handleUserActivity);
            window.addEventListener('keydown', handleUserActivity);

            // Cleanup event listeners on component unmount
            return () => {
                clearTimeout(window.signOutTimeout);
                window.removeEventListener('mousemove', handleUserActivity);
                window.removeEventListener('keydown', handleUserActivity);
            };
        }
    }, [session, resetSignOutTimeout]);

    return null; // No UI is needed for this hook
}

export default useAutoSignOut;
