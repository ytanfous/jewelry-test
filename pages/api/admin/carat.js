import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name } = req.body;
        try {
            const newType = await prisma.carat.create({
                data: { value : name },
            });
            res.status(200).json(newType);
        } catch (error) {
            res.status(400).json({ error: 'Error creating Carat' });
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.body;
        try {
            await prisma.carat.delete({
                where: { id: parseInt(id) },
            });
            res.status(200).json({ message: 'Type deleted' });
        } catch (error) {
            res.status(400).json({ error: 'Error deleting Carat' });
        }
    }else if (req.method === 'GET') {
        // Handle GET request: Fetch all Types
        try {
            const types = await prisma.carat.findMany();
            res.status(200).json(types);
        } catch (error) {
            res.status(400).json({ error: 'Error fetching Types' });
        }
    }
}