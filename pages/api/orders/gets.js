import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const {userId} = req.query;

        try {

            const user = await prisma.user.findUnique({
                where: {
                    id: parseInt(userId)
                },
            });
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }
            // Get orders for the user
            const orders = await prisma.order.findMany({
                orderBy: { createdAt: 'desc' },
                where: {
                    userId: parseInt(userId),
                    formattedOrderId: {
                        startsWith: 'CC-'
                    },

                },
            });

            res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({error: 'Error fetching orders', details: error.message});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
