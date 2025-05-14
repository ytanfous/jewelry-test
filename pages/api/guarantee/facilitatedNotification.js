import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    try {
        // Get today's date
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // Fetch records with date <= today and status = false
        const facilitatedRecords = await prisma.facilitated.findMany({
            orderBy: { date: 'desc' },
            where: {
                date: {
                    lte: todayEnd, // Date is less than or equal to today
                },
                status: false, // Status is false
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
                        clientCode: true,
                    },
                },
            },
        });

        // Filter for user-specific facilitated records
        const userFacilitated = facilitatedRecords.filter(record => record.guarantee.userId === parseInt(userId));

        res.status(200).json(userFacilitated);
    } catch (error) {
        console.error('Error fetching facilitated records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
