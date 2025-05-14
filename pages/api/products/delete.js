/*
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { id } = req.query;

        try {
            const productId = parseInt(id);

            // Delete related records manually
            await prisma.transactionhistory.deleteMany({ where: { productId } });
            await prisma.orderhistory.deleteMany({ where: { productId } });

            // Delete the product
            await prisma.products.delete({
                where: { id: productId },
            });

            res.status(200).json({ message: 'Product deleted' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Error deleting product' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
*/

import prisma from '@/lib/prisma'; // Import the custom Prisma client

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { id } = req.query;

        try {
            const productId = parseInt(id);

            // Check if the product is already deleted
            const product = await prisma.products.findUnique({
                where: { id: productId },
            });

            if (product.status === 'deleted') {
                return res.status(400).json({ error: 'Product is already deleted' });
            }

            // Update the product status to 'deleted'
            await prisma.products.update({
                where: { id: productId },
                data: {
                    status: 'deleted',
                    jewelerId: null,
                    date: new Date(),
                },
            });

            await prisma.transactionhistory.create({
                data: {
                    productId: productId,
                    jewelerId: product.jewelerId,
                    userId: product.userId,
                    status: 'deleted',
                    date: new Date(),
                },
            });


            res.status(200).json({ message: 'Product marked as deleted' });
        } catch (error) {
            console.error('Error marking product as deleted:', error);
            res.status(500).json({ error: 'Error marking product as deleted' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
