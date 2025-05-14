import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const {id, amount} = req.body;

        try {
            const existingSaving = await prisma.order.findUnique({
                where: {id: Number(id)},
            });
            if (!existingSaving) {
                return res.status(404).json({error: 'Saving not found'});
            }
            const newAmount = parseInt(existingSaving.advance) + Number(amount);
            const updatedOrder = await prisma.order.update({
                where: {id: parseInt(id)},
                data: {advance: String(newAmount)},
            });
            await prisma.orderhistory.create({
                data: {
                    action: 'update',
                    timestamp: new Date(),
                    amount: `${amount}`,
                    order: {
                        connect: { id: updatedOrder.id }, // Ensure the relation is connected
                    },
                },
            });

            res.status(200).json(updatedOrder);
        } catch (error) {
            console.error('Error updating saving:', error);
            res.status(500).json({error: 'Error updating saving'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
