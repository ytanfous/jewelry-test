import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const {id, amount,note,unit} = req.body;

        try {
            const existingSalf = await prisma.slaf.findUnique({
                where: {id: Number(id)},
            });
            if (!existingSalf) {
                return res.status(404).json({error: 'Salf not found'});
            }


            const updatedSalf = await prisma.slaf.update({
                where: {id: parseInt(id)},
                data: {amount,note,unit},
            });

            await prisma.salfhistory.create({
                data: {
                    action: 'update-rework',
                    slafId: updatedSalf.id,
                    userId: updatedSalf.userId,
                    value: amount,
                    jewelerId: updatedSalf.jewelerId ,
                }
            });

            res.status(200).json(updatedSalf);
        } catch (error) {
            console.error('Error updating slaf:', error);
            res.status(500).json({error: 'Error updating slaf'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
