import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const { userId, code } = req.query;

    if (req.method === 'GET') {
        try {
            const product = await prisma.products.findFirst({
                where: {
                    userId: parseInt(userId, 10),
                    code: code,
                },
            });

            if (product) {
                res.status(200).json(product);
            } else {
                res.status(404).json({ message: 'Product not found' });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
