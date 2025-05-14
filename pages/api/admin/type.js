import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, userId } = req.body;

        try {
            const newType = await prisma.type.create({
                data: {
                    name,
                    userId: userId ? parseInt(userId) : null, // Include userId or set to null
                },
            });

            res.status(200).json(newType);
        } catch (error) {
            console.error('Error creating Type:', error);
            res.status(400).json({ error: 'Error creating Type' });
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.body;

        try {
            await prisma.type.delete({
                where: { id: parseInt(id) },
            });

            res.status(200).json({ message: 'Type deleted' });
        } catch (error) {
            console.error('Error deleting Type:', error);
            res.status(400).json({ error: 'Error deleting Type' });
        }
    } else if (req.method === 'GET') {
        try {
            const types = await prisma.type.findMany({
                where: { userId: null },
            });
            res.status(200).json(types);
        } catch (error) {
            console.error('Error fetching Types:', error);
            res.status(400).json({ error: 'Error fetching Types' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
