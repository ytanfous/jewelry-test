import prisma from '@/lib/prisma';

async function getOrderCountForSupplier(supplierId) {
    const count = await prisma.order.count({
        where: {
            supplierId: supplierId,
            status: false,
        },
    });
    return count;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({message: 'Method not allowed'});
    }

    const {userId} = req.query;

    if (!userId) {
        return res.status(400).json({message: 'Missing userId'});
    }

    try {
        const suppliers = await prisma.supplier.findMany({
            where: {userId: parseInt(userId)},
            orderBy: { createdAt: 'desc' },
        });

        // Fetch order counts for each supplier
        const suppliersWithOrderCounts = await Promise.all(
            suppliers.map(async (supplier) => {
                const orderCount = await getOrderCountForSupplier(supplier.id);
                return {
                    ...supplier,
                    orderCount,
                };
            })
        );

        res.status(200).json(suppliersWithOrderCounts);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}
