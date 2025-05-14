import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, model, origin, carat, weight } = req.body;

        try {
            // Check if the user exists
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            console.log(model, origin, carat, weight, `${user.count + 1}`, userId);

            // Create the product
            const product = await prisma.products.create({
                data: {
                    userId,
                    
                    model: model ?? null,
                    origin: origin ?? null,
                    carat: carat ?? null,
                    weight: weight ?? null,
                    status: "Active",
                    code: `${user.count + 1}`,
                },
            });

            // Update the user's count
            await prisma.user.update({
                where: { id: userId },
                data: {
                    count: {
                        increment: 1,
                    },
                },
            });

            res.status(200).json({
                message: 'Product created successfully',
                redirect: '/jewelry/products/listProducts',
                product: product, // Include the product in the response
            });
        } catch (error) {
            res.status(500).json({ error: 'Error creating product', details: error.message });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
