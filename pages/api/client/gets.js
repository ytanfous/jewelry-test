import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            // Fetch clients along with the counts of orders, savings, and guarantees
            const clients = await prisma.client.findMany({
                where: {
                    userId: Number(userId),
                },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    location: true,
                    clientCode: true,
                    userId: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            orders: true,
                            savings: true,
                            guarantee: true,
                        }
                    }
                }
            });

            res.status(200).json(clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
