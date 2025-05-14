import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const {userId} = req.query;

        try {
            // Find user by ID
            const user = await prisma.user.findUnique({
                where: {id: parseInt(userId)},
            });
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }
            // Get products for the user
            const savings = await prisma.saving.findMany({
                where: {userId: parseInt(userId)},
                orderBy: { createdAt: 'desc' },
            });


            res.status(200).json(savings);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({error: 'Error fetching products', details: error.message});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
