import prisma from '@/lib/prisma';

export default async function handler(req, res) {
 if (req.method === 'GET') {
        const { userId } = req.query;
        try {
            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const types = await prisma.type.findMany({
                where: {
                    userId: parseInt(userId),
                },
            });

            res.status(200).json(types);
        } catch (error) {
            res.status(400).json({ error: 'Error fetching Types' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
