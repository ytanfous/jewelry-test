import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const {id, model, origin, carat, weight} = req.body;

        try {
            const product = await prisma.products.update({
                where: {id: parseInt(id)},
                data: {
                    model,
                    origin,
                    carat,
                    weight,
                },
            });

            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({error: 'Error updating product'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
