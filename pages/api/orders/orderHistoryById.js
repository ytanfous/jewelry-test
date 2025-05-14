import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const {orderId} = req.query;

        try {
            const order = await prisma.order.findUnique({
                where: {id: parseInt(orderId)},
            });

            if (!order) {
                return res.status(404).json({error: 'guarantee not found'});
            }

            const orderHistory = await prisma.orderhistory.findMany({
                where: {orderId: parseInt(orderId)},
            });

            res.status(200).json(orderHistory);
        } catch (error) {
            console.error('Error fetching guarantee history:', error);
            res.status(500).json({error: 'Error fetching guarantee history', details: error.message});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}