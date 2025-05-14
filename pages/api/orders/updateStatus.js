import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'PATCH') {
        const {id, status} = req.body;

        try {
            const updatedOrder = await prisma.order.update({
                where: {id: parseInt(id)},
                data: {status},
            });

            res.status(200).json(updatedOrder);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({error: 'Failed to update order status', details: error.message});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.setHeader('Allow', ['PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
