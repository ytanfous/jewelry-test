import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const {userId} = req.query;

    try {
        const user = await prisma.user.findUnique({
            where: {id: parseInt(userId)},
            select: {
                name: true,
                location: true,
                CompanyName: true,
                phone: true,
                email: true,
            },
        });

        if (user) {
            return res.status(200).json(user);
        }

        return res.status(404).json({message: 'User not found'});
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}
