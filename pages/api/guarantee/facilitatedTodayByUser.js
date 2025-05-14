import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    try {
        // Get today's date
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const facilitatedRecords = await prisma.facilitated.findMany({
            orderBy: { date: 'desc' },
            where: {
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            include: {
                guarantee: {
                    select: {
                        name: true,
                        phone: true,
                        price: true,
                        advance: true,
                        userId: true,
                        createdAt: true,
                        note: true,
                        formattedGuaranteeId: true,
                    },
                },
            },
        });

        const userFacilitated = facilitatedRecords.filter(record => record.guarantee.userId === parseInt(userId));

        res.status(200).json(userFacilitated);
    } catch (error) {
        console.error('Error fetching facilitated records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
