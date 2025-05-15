import prisma from '@/lib/prisma';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { userId } = req.query;
        try {
            const users = await prisma.user.findMany({
                where: {
                    id: {
                        not: parseInt(userId),
                    },
                }
            });

            // If there are no users found
            if (!users.length) {
                return res.status(404).json({ error: 'No other users found' });
            }

            // Return the list of users
            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Error fetching users', details: error.message });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}