import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {productId, userId, state} = req.body;

        if (!productId || !userId) {
            return res.status(400).json({error: 'Product ID is required'});
        }

        try {
            const product = await prisma.products.findUnique({
                where: {id: productId},
            });

            if (!product || product.userId !== userId) {
                return res.status(404).json({error: 'Product not found'});
            }

            if (state === 'Active') {

                const updatedProduct = await prisma.products.update({
                    where: {id: productId, userId},
                    data: {jewelerId: null, date: null, status: 'Active'},
                });

                await prisma.transactionhistory.create({
                    data: {
                        productId: product.id,
                        jewelerId: product.jewelerId,
                        userId: product.userId,
                        status: "Active",
                        date: new Date(),
                    },
                });
                res.status(200).json(updatedProduct);

            }

            if (state === 'Sold') {

                const updatedProduct = await prisma.products.update({
                    where: {id: productId, userId},
                    data: {jewelerId: null, date: null, status: 'Sold'},
                });

                await prisma.transactionhistory.create({
                    data: {
                        productId: product.id,
                        jewelerId: product.jewelerId,
                        userId: product.userId,
                        status: "Sold",
                        date: new Date(),
                    },
                });
                res.status(200).json(updatedProduct);

            }


        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({error: 'Failed to update product'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
