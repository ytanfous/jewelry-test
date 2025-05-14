import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Only PUT requests allowed' });
    }



    const { clientCode, location, name, phone, userId } = req.body;

    try {
        // Start a transaction
        const updatedClient = await prisma.$transaction(async (transaction) => {
            // Update the client
            const client = await transaction.client.update({
                where: { clientCode: clientCode },
                data: {
                    location: location,
                    name: name,
                    phone: phone,
                    userId: userId,
                },
            });

            // Update all related guarantees
            await transaction.guarantee.updateMany({
                where: { clientid: client.id },
                data: {
                    name: name || client.name,
                    phone: phone || client.phone,
                },
            });

            // Update all related savings
            await transaction.saving.updateMany({
                where: { clientid: client.id },
                data: {
                    name: name || client.name,
                    phone: phone || client.phone,
                },
            });

            // Update all related orders
            await transaction.order.updateMany({
                where: { clientid: client.id },
                data: {
                    name: name || client.name,
                },
            });

            return client; // Return the updated client
        });

        res.status(200).json(updatedClient);
    } catch (error) {
        res.status(400).json({ message: 'Client update failed', error: error.message });
    } finally {
        await prisma.$disconnect();
    }
}