import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {orderId, userId} = req.body;

        if (!orderId || !userId) {
            return res.status(400).json({error: 'Order ID and User ID are required'});
        }

        try {
            const order = await prisma.order.findUnique({
                where: {id: parseInt(orderId, 10)},
            });

            if (!order || order.userId !== userId) {
                return res.status(404).json({error: 'Order not found or unauthorized'});
            }

            // Delete related OrderHistory records
            await prisma.orderhistory.deleteMany({
                where: {orderId: parseInt(orderId, 10)},
            });

            // Delete the Order
            await prisma.order.delete({
                where: {id: parseInt(orderId, 10)},
            });

            res.status(200).json({message: 'Order deleted successfully'});

        } catch (error) {
            console.error('Error deleting order:', error);
            res.status(500).json({error: 'Failed to delete order'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
