import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { codes, userId, state } = req.body;

        if (!codes || !userId) {
            return res.status(400).json({ error: 'Product codes and User ID are required' });
        }

        try {
            // Fetch products with multiple codes
            const products = await prisma.products.findMany({
                where: {
                    code: {
                        in: codes, // Match multiple codes
                    },
                    userId,
                },
            });

            if (products.length === 0) {
                return res.status(404).json({ error: 'No matching products found' });
            }

            const updatePromises = products.map((product) => {
                let updatedData = { jewelerId: null, date: null, status: state };
                if (state === 'Active' || state === 'Sold') {
                    return prisma.products.update({
                        where: { id: product.id },
                        data: updatedData,
                    });
                }
                return null;
            }).filter(Boolean);

            const transactionPromises = products.map((product) => {
                return prisma.transactionhistory.create({
                    data: {
                        productId: product.id,
                        jewelerId: product.jewelerId,
                        userId: product.userId,
                        status: state,
                        date: new Date(),
                    },
                });
            });

            await Promise.all([...updatePromises, ...transactionPromises]);

            return res.status(200).json({ message: 'Products updated and transactions created' });

        } catch (error) {
            console.error('Error updating products:', error);
            return res.status(500).json({ error: 'Failed to update products' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
