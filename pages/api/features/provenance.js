import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({message: 'Method not allowed'});
    }

    try {
        const provenance = await prisma.provenance.findMany();
        res.status(200).json(provenance);
    } catch (error) {
        console.error('Error fetching provenance:', error);
        res.status(500).json({message: 'Internal server error'});
    } finally {
        await prisma.$disconnect();
    }
}
