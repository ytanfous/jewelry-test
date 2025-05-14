import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({message: 'Method Not Allowed'});
    }

    const {jewelerId, userId} = req.query;

    try {
        const history = await prisma.transactionhistory.findMany({
            orderBy: { date: 'desc' },

            where: {
                jewelerId: parseInt(jewelerId),
                userId: parseInt(userId)
            },
            include: {
                product: {
                    select: {
                        code: true,
                        weight: true,
                        carat: true,
                        model: true,
                        origin: true
                    }
                },
                jeweler: true,
                user: true,

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
