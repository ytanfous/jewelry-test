import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, jewelerId } = req.query;

        if (!userId || !jewelerId) {
            return res.status(400).json({ message: 'userId and jewelerId are required' });
        }

        // First get all records ordered by createdAt descending
        const slafs = await prisma.slaf.findMany({
            where: {
                userId: parseInt(userId, 10),
                jewelerId: parseInt(jewelerId, 10),
            },
            include: {
                SalfHistory: true,
            },
        });

        // Custom sorting logic
        const sortedSlafs = slafs.sort((a, b) => {
            // Determine the category for each record
            const getCategory = (record) => {
                if (record.amount && parseFloat(record.amount) > 0) {
                    return 1; // Non-payment (negative amount)
                } else if (record.note) {
                    return 2; // Note
                } else {
                    return 3; // Payment (positive amount)
                }
            };

            const categoryA = getCategory(a);
            const categoryB = getCategory(b);

            // First sort by category
            if (categoryA !== categoryB) {
                return categoryA - categoryB;
            }

            // If same category, sort by createdAt descending
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.status(200).json({ slafs: sortedSlafs });
    } catch (error) {
        console.error('Error fetching Slaf records:', error.message, error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
}