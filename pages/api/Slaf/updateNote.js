import prisma from "@/lib/prisma";

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        try {
            const { id, jewelerId, userId, note } = req.body;

            // Validate required fields
            if (!id || !jewelerId || !userId) {
                return res.status(400).json({ error: "Missing required fields." });
            }

            // Update the transaction
            const updatedTransaction = await prisma.salfhistory.updateMany({
                where: {
                    id: Number(id),
                    jewelerId: Number(jewelerId),
                    userId: Number(userId),
                },
                data: {
                    note: note === undefined ? null : note,
                },
            });

            if (updatedTransaction.count === 0) {
                return res.status(404).json({ error: "Transaction not found." });
            }

            return res.status(200).json({ message: "Note updated successfully." });
        } catch (error) {
            console.error("Error updating note:", error);
            return res.status(500).json({ error: "An error occurred while updating the note." });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }
}
