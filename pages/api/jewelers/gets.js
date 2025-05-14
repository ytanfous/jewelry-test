import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const {userId} = req.query;
        if (!userId) {
            return res.status(400).json({message: 'userId parameter is required'});
        }

        const Jewelers = await prisma.jeweler.findMany({
            orderBy: { createdAt: 'desc' },
            where: {
                userId: parseInt(userId),
            },
        });
        // Disconnect from the database
        await prisma.$disconnect();
        res.json(Jewelers);
    } else {
        res.status(405).json({message: 'Method Not Allowed'});
    }
}
