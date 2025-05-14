import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const {id} = req.query;

        try {
            await prisma.order.delete({
                where: {id: parseInt(id)},
            });

            res.status(200).json({message: 'Product deleted'});
        } catch (error) {
            res.status(500).json({error: 'Error deleting product'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
