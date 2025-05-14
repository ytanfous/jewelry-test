import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({message: 'Method Not Allowed'});
    }

    const {jewelerId, userId} = req.query;

    try {
        const history = await prisma.salfhistory.findMany({
            orderBy: { createdAt: 'desc' },

            where: {
                jewelerId: parseInt(jewelerId),
                userId: parseInt(userId)
            },
            include: {
                slaf: true,
            },
        });

        return res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        return res.status(500).json({message: 'Failed to fetch transaction history'});
    } finally {
        await prisma.$disconnect();
    }
}
