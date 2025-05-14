import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const {guaranteeId} = req.query;

        try {
            const guarantee = await prisma.guarantee.findUnique({
                where: {id: parseInt(guaranteeId)},
            });

            if (!guarantee) {
                return res.status(404).json({error: 'guarantee not found'});
            }

            const guaranteeHistory = await prisma.guaranteeHistory.findMany({
                where: {guaranteeId: parseInt(guaranteeId)},
            });

            res.status(200).json(guaranteeHistory);
        } catch (error) {
            console.error('Error fetching guarantee history:', error);
            res.status(500).json({error: 'Error fetching guarantee history', details: error.message});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}