import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id, userId, amount, location, name, phone, note } = req.body;

        // Validate required fields
        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        const result = await prisma.$transaction(async (transaction) => {
            // Fetch the existing saving entry with client
            const existingSaving = await transaction.saving.findUnique({
                where: { id },
                include: { client: true },
            });

            if (!existingSaving) {
                throw new Error('Saving entry not found');
            }

            const updateData = {
                amount: amount !== undefined ? parseInt(amount) : existingSaving.amount,
                ...(location && { location }),
                ...(name && { name }),
                ...(phone && { phone }),
                ...(note && { note }),
            };

            // Update the saving entry
            const updatedSaving = await transaction.saving.update({
                where: { id },
                data: updateData,
            });

            // If linked to a client, update client and related records
            if (existingSaving.client) {
                const clientUpdateData = {
                    ...(location && { location }),
                    ...(name && { name }),
                    ...(phone && { phone }),
                };

                // Only update if there are changes
                if (Object.keys(clientUpdateData).length > 0) {
                    await transaction.client.update({
                        where: { id: existingSaving.client.id },
                        data: clientUpdateData,
                    });

                    // Batch update related records only if name or phone changed
                    if (name || phone) {
                        const updateManyData = {
                            ...(name && { name }),
                            ...(phone && { phone }),
                        };

                        await Promise.all([
                            transaction.guarantee.updateMany({
                                where: { clientid: existingSaving.client.id },
                                data: updateManyData,
                            }),
                            transaction.saving.updateMany({
                                where: { clientid: existingSaving.client.id },
                                data: {
                                    ...updateManyData,
                                    ...(location && { location }),
                                },
                            }),
                        ]);

                        if (name) {
                            await transaction.order.updateMany({
                                where: { clientid: existingSaving.client.id },
                                data: { name },
                            });
                        }
                    }
                }
            }

            // Create history record if amount changed
            if (amount !== undefined && amount !== existingSaving.amount) {
                const difference = parseInt(amount) - existingSaving.amount;
                await transaction.savinghistory.create({
                    data: {
                        action: 'update',
                        savingId: updatedSaving.id,
                        userId,
                        details: `${difference} Dt`,
                    },
                });
            }

            return updatedSaving;
        }, {
            timeout: 20000, // Increased timeout to 20 seconds
            maxWait: 20000,
        });

        return res.status(200).json({
            message: 'Saving entry and client updated successfully',
            redirect: '/jewelry/saving/listSavings',
        });

    } catch (error) {
        console.error('Error updating saving:', error);
        if (error.message === 'Saving entry not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    } finally {
        await prisma.$disconnect();
    }
}