import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const {id} = req.query;

    if (req.method === 'GET') {
        try {
            const product = await prisma.products.findUnique({
                where: {id: parseInt(id)},
            });

            if (!product) {
                return res.status(404).json({error: 'Product not found'});
            }

            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({error: 'Error fetching product'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
