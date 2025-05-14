import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const {supplierId} = req.query;

    if (!supplierId) {
        return res.status(400).json({error: 'Supplier ID parameter is required'});
    }

    if (req.method === 'GET') {
        try {
            const orders = await prisma.order.findMany({
                where: {supplierId: parseInt(supplierId, 10), quantity: {gt: 0}},
                include: {supplier: true},
            });

            res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching orders by supplier ID:', error);
            res.status(500).json({error: 'Failed to fetch orders by supplier ID'});
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
