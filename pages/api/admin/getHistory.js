import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const history = await prisma.connectionhistory.findMany({
            where: { userId: parseInt(userId, 10) },
            select: {
                loginTime: true,
                ipAddress: true,
            },
        });
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching connection history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
}