import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId } = req.query;

        // Fetch types based on the userId or where userId is null
        const types = await prisma.type.findMany({
            where: {
                OR: [
                    { userId: parseInt(userId) }, // Filter by userId if provided
                    { userId: null } // Include types where userId is null
                ],
            },
        });

        res.status(200).json(types);
    } catch (error) {
        console.error('Error fetching types:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
