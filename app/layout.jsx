import {Inter} from "next/font/google";
import "./globals.css";
import SessionProvider from "@/app/SessionProvider";


const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Bijoux",
    description: "Generated by create next app",
};

export default function RootLayout({children}) {

    return (
        <html lang="en">
        <body>
        <SessionProvider>
            {children}
        </SessionProvider>
        </body>
        </html>
    );
}
