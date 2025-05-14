import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {userId, orderId, quantity} = req.body;
        console.log(userId, orderId, quantity);
        if (!quantity || quantity <= 0) {
            return res.status(400).json({error: 'Quantity must be a positive integer'});
        }

        try {
            const user = await prisma.user.findUnique({
                where: {id: userId},
            });

            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }

            const order = await prisma.order.findUnique({
                where: {id: orderId},
                include: {supplier: true},
            });

            if (!order) {
                return res.status(404).json({error: 'Order not found'});
            }

            if (order.quantity < quantity) {
                return res.status(400).json({error: 'Not enough quantity in the order'});
            }

            // Extract order details
            const {model, origin, carat, weight} = order;

            const createdProducts = [];
            const orderHistoryRecords = [];

            for (let i = 0; i < quantity; i++) {
                const product = await prisma.products.create({
                    data: {
                        model,
                        origin,
                        carat,
                        weight,
                        status: 'Active',
                        code: `${user.count + 1 + i}`,
                        userId,
                    },
                });
                createdProducts.push(product);

                orderHistoryRecords.push({
                    orderId: order.id,
                    productId: product.id,
                    supplierId: order.supplierId,
                    action: 'Order to Product transformation',
                    timestamp: new Date(),
                });
            }

            // Update the user's count
            await prisma.user.update({
                where: {id: userId},
                data: {
                    count: {
                        increment: parseInt(quantity), // Ensure quantity is parsed as an integer
                    },
                },
            });

            // Update order quantity and status
            const updatedOrder = await prisma.order.update({
                where: {id: order.id},
                data: {
                    quantity: order.quantity - quantity,
                    status: order.quantity - quantity === 0 ? true : order.status,
                },
            });

            // Record the transactions in the order history
            await prisma.orderhistory.createMany({
                data: orderHistoryRecords,
            });

            res.status(200).json({
                message: `${quantity} products created from order successfully`,
                products: createdProducts,
                updatedOrder,
            });

        } catch (error) {
            console.error('Error creating products:', error);
            res.status(500).json({error: 'Error creating products', details: error.message});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
