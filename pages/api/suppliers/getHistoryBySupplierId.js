// pages/api/suppliers/getHistoryBySupplierId.js

import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const {supplierId} = req.query;

    try {
        const orderHistory = await prisma.orderhistory.findMany({
            where: {
                supplierId: parseInt(supplierId),
            },
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                order: true,    // Include related Order entity
                product: true,  // Include related Products entity
                supplier: true, // Include related Supplier entity
            },
        });

        res.status(200).json(orderHistory);
    } catch (error) {
        console.error('Failed to fetch order history', error);
        res.status(500).json({error: 'Failed to fetch order history'});
    }
}
