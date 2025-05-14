import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const {savingId} = req.query;

        try {
            // Find saving by ID
            const saving = await prisma.saving.findUnique({
                where: {id: parseInt(savingId)},
            });

            if (!saving) {
                return res.status(404).json({error: 'Saving not found'});
            }

            // Get saving history for the given savingId
            const savingHistory = await prisma.savinghistory.findMany({
                where: {savingId: parseInt(savingId)},
            });

            res.status(200).json(savingHistory);
        } catch (error) {
            console.error('Error fetching saving history:', error);
            res.status(500).json({error: 'Error fetching saving history', details: error.message});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}