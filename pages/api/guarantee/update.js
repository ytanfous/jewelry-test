import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id, name, phone, selectedComponent, price, advance, months, tableData, note, selectedSection } = req.body;

        // Begin transaction
        const result = await prisma.$transaction(async (transaction) => {
            // Fetch the existing guarantee entry
            const existingGuarantee = await transaction.guarantee.findUnique({
                where: { id },
                include: {
                    client: true,
                    tableData: true,
                    rows: true // Include rows to check selectedSection
                },
            });

            if (!existingGuarantee) {
                return res.status(404).json({ message: 'Guarantee entry not found' });
            }

            let client = existingGuarantee.client;

            // Check if price or advance actually changed
            const priceChanged = price !== undefined && parseInt(price) !== existingGuarantee.price;
            const advanceChanged = advance !== undefined && String(advance) !== existingGuarantee.advance;

            // Update the guarantee entry
            const updatedGuarantee = await transaction.guarantee.update({
                where: { id },
                data: {
                    name: name || existingGuarantee.name,
                    phone: phone || existingGuarantee.phone,
                    selectedComponent: selectedComponent || existingGuarantee.selectedComponent,
                    price: price ? parseInt(price) : existingGuarantee.price,
                    advance: advance !== undefined ? String(advance) : existingGuarantee.advance,
                    months: months !== undefined ? String(months) : existingGuarantee.months,
                    note: note ?? existingGuarantee.note,
                },
            });

            // Update product statuses if selectedSection is provided
            if (selectedSection && existingGuarantee.rows.length > 0) {
                await Promise.all(existingGuarantee.rows.map(async (product) => {
                    await transaction.products.update({
                        where: { id: product.id },
                        data: {
                            status: selectedSection
                        }
                    });
                }));
            }

            // Client updates (unchanged)
            if (client) {
                await transaction.client.update({
                    where: { id: client.id },
                    data: {
                        name: name || client.name,
                        phone: phone || client.phone,
                    },
                });

                await transaction.guarantee.updateMany({
                    where: { clientid: client.id },
                    data: {
                        name: name || client.name,
                        phone: phone || client.phone,
                    },
                });

                await transaction.saving.updateMany({
                    where: { clientid: client.id },
                    data: {
                        name: name || client.name,
                        phone: phone || client.phone,
                    },
                });

                await transaction.order.updateMany({
                    where: { clientid: client.id },
                    data: {
                        name: name || client.name,
                    },
                });
            }

            if (selectedComponent === "Facilitated") {
                // Update tableData if provided
                if (tableData) {
                    await transaction.facilitated.deleteMany({
                        where: { guaranteeId: updatedGuarantee.id },
                    });

                    await transaction.facilitated.createMany({
                        data: tableData.map(data => ({
                            guaranteeId: updatedGuarantee.id,
                            date: new Date(data.date),
                            checkNumber: data.status ? 'Paid' : 'Pending',
                            amount: data.amount.toString(),
                            status: data.status || false,
                        })),
                    });
                }

                // Only create history if price or advance changed
                if (priceChanged || advanceChanged) {
                    await transaction.guaranteeHistory.create({
                        data: {
                            guaranteeId: updatedGuarantee.id,
                            amount: parseFloat(price || existingGuarantee.price).toFixed(2) -
                                parseFloat(advance || existingGuarantee.advance).toFixed(2),
                            action: "Updated",
                        }
                    });
                }
            }

            return updatedGuarantee;
        });

        res.status(200).json({
            message: 'Guarantee updated successfully',
            redirect: '/jewelry',
        });
    } catch (error) {
        console.error('Error updating guarantee:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}