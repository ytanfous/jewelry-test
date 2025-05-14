// pages/api/orders/create.js

import prisma from '@/lib/prisma';
import serverPath from "@/utils/serverPath";
import fs from "fs";
import path from "path";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Set this to the size you need
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, orders } = req.body;

    if (!userId || !Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const result = await prisma.$transaction(async (transaction) => {
            let userOrderSequence = await transaction.userOrderSequence.findUnique({
                where: { userId },
            });

            if (!userOrderSequence) {
                userOrderSequence = await transaction.userOrderSequence.create({
                    data: {
                        userId,
                        lastSeq: 0,
                    },
                });
            }

            let userClientSequence = await transaction.userClientSequence.findUnique({
                where: { userId },
            });

            if (!userClientSequence) {
                userClientSequence = await transaction.userClientSequence.create({
                    data: {
                        userId,
                        lastSeq: 0,
                    },
                });
            }

            let lastSeq = userOrderSequence.lastSeq;
            let lastSeqClient = userClientSequence.lastSeq;

            const newOrders = [];

            for (const order of orders) {
                const newSeq = ++lastSeq;
                const newSeqClient = ++lastSeqClient;
                const formattedOrderId = `CC-${userId}00${newSeq}`;

                // Create or get the client based on clientCode
                let client = null;
                let clientCode = order.clientCode || null;

                if (clientCode) {
                    client = await transaction.client.findUnique({
                        where: { clientCode },
                    });
                }

                if (!client && !clientCode) {
                    // Create new client if clientCode is empty
                    client = await transaction.client.create({
                        data: {
                            name: order.name,

                            clientCode: `C-${userId}00${newSeqClient}`,
                            userId,
                        },
                    });

                    clientCode = client.clientCode; // Set the clientCode for the order
                }

                // Handle image file if exists
                let imageURL = null;
                if (order?.image) {
                    const imagesDir = serverPath('pages/api/images/orders');
                    if (!fs.existsSync(imagesDir)) {
                        fs.mkdirSync(imagesDir, { recursive: true });
                    }

                    const mimeType = order.image.type; // e.g., 'image/jpeg'
                    const extension = mimeType.split('/')[1]; // Extracts 'jpeg'
                    const fileName = `${Math.floor(Math.random() * 10000000)}.${extension}`;
                    const filePath = path.join(imagesDir, fileName);

                    const base64Data = order.image.dataURL.split(',')[1];
                    const bufferImage = Buffer.from(base64Data, 'base64');
                    fs.writeFileSync(filePath, bufferImage);

                    imageURL = `/api/images/orders/${fileName}`;
                }

                // Create the order with associated client
                const newOrder = await transaction.order.create({
                    data: {
                        model: order.model || null,
                        origin: order.origin || null,
                        carat: order.carat || null,
                        weight: order.weight || null,
                        image: imageURL || null,
                        name: order.name,
                        quantity: order.quantity ? parseInt(order.quantity) : null,
                        note: order.note || null,
                        advance: order.advance || null,
                        price: order.price || null,
                        userId,
                        status: false,
                        formattedOrderId,
                        clientCode: clientCode || null, // Add clientCode to the order
                        client: client ? { connect: { id: client.id } } : undefined,
                        months: String(order.months) || "1",
                    },
                });

                await transaction.orderhistory.create({
                    data: {
                        action: "Order Created",
                        timestamp: new Date(),
                        amount: newOrder.advance || "0",
                        order: {
                            connect: { id: newOrder.id }, // Connect to the newly created order
                        },
                    },
                });

                newOrders.push({
                    order: newOrder,
                    client: client // Include the client data
                });
            }

            await transaction.userOrderSequence.update({
                where: { userId },
                data: { lastSeq },
            });

            await transaction.userClientSequence.update({
                where: { userId },
                data: { lastSeq: lastSeqClient },
            });
            return newOrders;
        });

        res.status(200).json({
            message: 'Orders created successfully',
            orders: result,
            redirect: '/jewelry/order/listOrders',

        });
    } catch (error) {
        console.error('Error creating orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
