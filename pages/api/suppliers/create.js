import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({message: 'Method not allowed'});
    }

    const {userId, orders, supplier} = req.body;

    if (!userId || !Array.isArray(orders) || orders.length === 0 || !supplier) {
        return res.status(400).json({message: 'Invalid input data'});
    }

    try {
        const result = await prisma.$transaction(async (transaction) => {
            let supplierRecord;

            if (supplier.formattedSupplierId) {
                supplierRecord = await transaction.supplier.findUnique({
                    where: {formattedSupplierId: supplier.formattedSupplierId},
                });
            }

            if (!supplierRecord) {
                let userSupplierSequence = await transaction.userSupplierSequence.findUnique({
                    where: {userId},
                });

                if (!userSupplierSequence) {
                    userSupplierSequence = await transaction.userSupplierSequence.create({
                        data: {
                            userId,
                            lastSeq: 0,
                        },
                    });
                }

                let lastSeq = userSupplierSequence.lastSeq;
                const newSeq = ++lastSeq;
                const formattedSupplierId = `FO-${userId}00${newSeq}`;

                supplierRecord = await transaction.supplier.create({
                    data: {
                        ...supplier,
                        userId,
                        formattedSupplierId,
                    },
                });

                await transaction.userSupplierSequence.update({
                    where: {userId},
                    data: {lastSeq},
                });
            }

            const newOrders = [];
            const orderHistoryRecords = [];
            for (const order of orders) {
                let userOrderSequence = await transaction.userOrderSequence.findUnique({
                    where: {userId},
                });

                if (!userOrderSequence) {
                    userOrderSequence = await transaction.userOrderSequence.create({
                        data: {
                            userId,
                            lastSeq: 0,
                        },
                    });
                }

                let lastSeq = userOrderSequence.lastSeq;
                const newSeq = ++lastSeq;
                const formattedOrderId = `CF-${userId}00${newSeq}`;

                const newOrder = await transaction.order.create({
                    data: {
                        ...order,
                        userId,
                        supplierId: supplierRecord.id,
                        formattedOrderId,
                        formattedSupplierId: supplierRecord.formattedSupplierId,
                        status: false,
                        quantity: order.quantity ? parseInt(order.quantity) : null,
                    },
                });
                await transaction.orderhistory.create({
                    data: {
                        orderId: newOrder.id,
                        productId: order.productId || null,
                        supplierId: supplierRecord.id,
                        action: 'Ajouter Commande',
                        timestamp: new Date(),
                    },
                });

                newOrders.push(newOrder);

                await transaction.userOrderSequence.update({
                    where: {userId},
                    data: {lastSeq: newSeq},
                });
            }
            await prisma.orderhistory.createMany({
                data: orderHistoryRecords,
            });

            return {supplier: supplierRecord, orders: newOrders};
        });


        res.status(200).json({
            message: 'Supplier and orders created/updated successfully',
            supplier: result.supplier,
            orders: result.orders,
            redirect: `/jewelry/order/suppliers/${result.supplier.id}`,
        });
    } catch (error) {
        console.error('Error creating/updating supplier and orders:', error);
        res.status(500).json({message: 'Internal server error'});
    } finally {
        await prisma.$disconnect();
    }
}
