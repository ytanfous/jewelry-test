import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const { username } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { username: username },
            select: { type: true },
        });

        if (user) {
            res.status(200).json({ type: user.type });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}
