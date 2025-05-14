import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId } = req.query;

    try {
        // Get today's date in ISO string format for comparison (to ensure we match the full date)
        const today = new Date().toISOString().split('T')[0]; // This will return "YYYY-MM-DD"

        const history = await prisma.transactionhistory.findMany({
            orderBy: { date: 'desc' },
            where: {
                userId: parseInt(userId),  // Filter by userId
                product: {
                    jewelerId: {
                        not: null, // Ensure the product has a jewelerId
                    },

                },
                status: {
                    not: "Active", // Ensure the product has a jewelerId
                },
                date: {
                    gte: new Date(today),   // Filter to only today's date or newer
                    lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)), // Ensures we're getting only today's entries
                }
            },
            include: {
                product: true,  // Optionally include product details if needed
                jeweler: true,  // Optionally include jeweler details if needed
            }
        });

        return res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        return res.status(500).json({ message: 'Failed to fetch transaction history' });
    } finally {
        await prisma.$disconnect();
    }
}