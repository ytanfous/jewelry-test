import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const {id} = req.query;

    if (req.method === 'GET') {
        try {
            const supplier = await prisma.supplier.findUnique({
                where: {id: parseInt(id, 10)},
                include: {orders: true},
            });

            if (!supplier) {
                return res.status(404).json({error: 'Supplier not found'});
            }

            res.status(200).json(supplier);
        } catch (error) {
            console.error('Error fetching supplier:', error);
            res.status(500).json({error: 'Failed to fetch supplier'});
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.$transaction(async (prisma) => {
                const supplierId = parseInt(id, 10);

                await prisma.orderhistory.deleteMany({
                    where: {supplierId},
                });

                await prisma.order.deleteMany({
                    where: {supplierId},
                });

                await prisma.supplier.delete({
                    where: {id: supplierId},
                });
            });

            res.status(200).json({message: 'Supplier and related orders and history deleted successfully'});
        } catch (error) {
            console.error('Error deleting supplier and related orders and history:', error);
            res.status(500).json({error: 'Failed to delete supplier and related orders and history'});
        }
    } else if (req.method === 'PUT') {
        const {name, contact,advance,note,price} = req.body;
        try {
            const supplier = await prisma.supplier.update({
                where: {id: parseInt(id, 10)},
                data: {name, contact,advance,note,price},
            });

            res.status(200).json(supplier);
        } catch (error) {
            console.error('Error updating supplier:', error);
            res.status(500).json({error: 'Failed to update supplier'});
        }
    } else {
        res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
