import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const {id, amount} = req.body;

        try {
            const existingSaving = await prisma.saving.findUnique({
                where: {id: Number(id)},
            });
            if (!existingSaving) {
                return res.status(404).json({error: 'Saving not found'});
            }
            const newAmount = existingSaving.amount + Number(amount);
            const updatedSaving = await prisma.saving.update({
                where: {id: parseInt(id)},
                data: {amount: newAmount},
            });

            // Create history record for the update
            await prisma.savinghistory.create({
                data: {
                    action: 'update',
                    savingId: updatedSaving.id,
                    userId: updatedSaving.userId,
                    details: `${amount} Dt`
                }
            });

            res.status(200).json(updatedSaving);
        } catch (error) {
            console.error('Error updating saving:', error);
            res.status(500).json({error: 'Error updating saving'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
