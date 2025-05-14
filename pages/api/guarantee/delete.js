import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Guarantee ID is required' });
        }

        try {
            await prisma.$transaction(async (transaction) => {
                // Step 1: Check if the guarantee exists
                const guarantee = await transaction.guarantee.findUnique({
                    where: { id: Number(id) },
                    include: {
                        tableData: true, // Include related facilitated entries
                        GuaranteeHistory: true, // Include related GuaranteeHistory entries
                    },
                });

                if (!guarantee) {
                    throw new Error('Guarantee not found');
                }

                // Step 2: Delete related facilitated entries
                if (guarantee.tableData && guarantee.tableData.length > 0) {
                    await transaction.facilitated.deleteMany({
                        where: { guaranteeId: Number(id) },
                    });
                }

                // Step 3: Delete related GuaranteeHistory entries
                if (guarantee.GuaranteeHistory && guarantee.GuaranteeHistory.length > 0) {
                    await transaction.GuaranteeHistory.deleteMany({
                        where: { guaranteeId: Number(id) },
                    });
                }

                // Step 4: Delete the guarantee
                await transaction.guarantee.delete({
                    where: { id: Number(id) },
                });
            });

            res.status(200).json({ message: 'Guarantee and related records deleted successfully' });
        } catch (error) {
            console.error('Error deleting guarantee:', error);
            res.status(500).json({ error: 'Error deleting guarantee', details: error.message });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}