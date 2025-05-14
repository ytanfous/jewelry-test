import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { codes, jewelerId, userId } = req.body;

    try {
        const products = await prisma.products.findMany({
            where: {
                status: "Active",
                code: {
                    in: codes, // Match multiple codes
                },
                userId,
            },
        });

        if (products.length === 0) {
            return res.status(404).json({ message: 'No matching products found' });
        }

        const updatePromises = products.map((product) =>
            prisma.products.update({
                where: { id: product.id },
                data: {
                    jewelerId: parseInt(jewelerId),
                    status: "Lend",
                    date: new Date(),
                },
            })
        );

        const transactionPromises = products.map((product) =>
            prisma.transactionhistory.create({
                data: {
                    productId: product.id,
                    jewelerId: parseInt(jewelerId),
                    userId: product.userId,
                    status: "Lend",
                    date: new Date(),
                },
            })
        );

        await Promise.all([...updatePromises, ...transactionPromises]);

        return res.status(200).json({ message: 'Products updated and transactions created' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
}
