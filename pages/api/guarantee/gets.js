import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    try {
        const guarantees = await prisma.guarantee.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: 'desc' },
            include: {
                tableData: true,
                rows: {
                    select: {
                        code: true,
                        status: true,
                    },

                },


            },
        });

        res.status(200).json(guarantees);
    } catch (error) {
        console.error('Error fetching guarantees:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
