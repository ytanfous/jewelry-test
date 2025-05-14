import prisma from "@/lib/prisma"; // Adjust the import path based on your setup
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const session = await getSession({ req });
        if (!session || !session.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const clients = await prisma.client.findMany({
            where: { userId: session.user.id }, // Fetch clients for the logged-in user
        });

        res.status(200).json(clients);
    } catch (error) {
        console.error("Error fetching client codes:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
