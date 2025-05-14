import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({message: 'Method Not Allowed'});
    }

    const {jewelerId} = req.query;

    try {
        const products = await prisma.products.findMany({
            where: {
                jewelerId: parseInt(jewelerId),
                status: {
                    not: "WESLET", 
                },
            },
        });

        return res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({message: 'Failed to fetch products'});
    } finally {
        await prisma.$disconnect();
    }
}
