import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    let formattedGuaranteeId = '';

    try {
        let { name, phone, rows, selectedComponent, selectedSection, price, advance, months, tableData, userId, note, code } = req.body;
        let codeC;
        if (!rows || !selectedComponent || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!price) {
            price = 0;
        }

        const result = await prisma.$transaction(async (transaction) => {
            let userGuaranteeSequence = await transaction.userGuaranteeSequence.findUnique({
                where: { userId }
            });

            if (!userGuaranteeSequence) {
                userGuaranteeSequence = await transaction.userGuaranteeSequence.create({
                    data: {
                        userId,
                        lastSeq: 0
                    }
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

            const newSeq = userGuaranteeSequence.lastSeq + 1;
            let newSeqClient = userClientSequence.lastSeq;

            let client = null;
            let clientCode = code || null;

            if (clientCode) {
                client = await transaction.client.findUnique({
                    where: { clientCode },
                });
            }

            if (!client && !clientCode) {
                newSeqClient = userClientSequence.lastSeq + 1;
                client = await transaction.client.create({
                    data: {
                        userId,
                        name,
                        phone,
                        clientCode: `C-${userId}00${newSeqClient}`,
                    },
                });
                clientCode = client.clientCode;
            }

            let newGuarantee;

            if (selectedComponent === 'Cash') {
                formattedGuaranteeId = `ES-${userId}00${newSeq}`;
                newGuarantee = await transaction.guarantee.create({
                    data: {
                        name,
                        phone,
                        note,
                        selectedComponent,
                        status: 'Active',
                        userId,
                        price: parseInt(price),
                        formattedGuaranteeId,
                        clientCode: clientCode || null,
                        client: client ? { connect: { id: client.id } } : undefined,
                    }
                });
            } else {
                formattedGuaranteeId = `PF-${userId}00${newSeq}`;
                newGuarantee = await transaction.guarantee.create({
                    data: {
                        name,
                        phone,
                        selectedComponent,
                        status: 'Active',
                        note,
                        userId,
                        price,
                        clientCode: clientCode || null,
                        client: client ? { connect: { id: client.id } } : undefined,
                        advance: advance.toString(),
                        months: months.toString(),
                        tableData: {
                            create: tableData.map(data => ({
                                date: new Date(data.date),
                                checkNumber: data.checkNumber || 'Pending',
                                amount: data.amount.toString(),
                                status: false,
                            }))
                        },
                        formattedGuaranteeId,
                    }
                });
            }

            // Log the action in GuaranteeHistory
            if(selectedComponent === 'Cash') {
                await transaction.guaranteeHistory.create({
                    data: {
                        guaranteeId: newGuarantee.id,
                        amount: parseInt(price), // Store the transaction amount
                        action: "Created",
                    }
                });
            }else{
                await transaction.guaranteeHistory.create({
                    data: {
                        guaranteeId: newGuarantee.id,
                        amount: parseFloat(advance).toFixed(2), // Store the transaction amount
                        action: "Created",
                    }
                });
            }


            await Promise.all(rows.map(async (row) => {
                const productId = parseInt(row.product.id);
                if (isNaN(productId)) {
                    throw new Error('Invalid id value provided.');
                }

                if(selectedComponent === 'Cash'){
                    await transaction.products.update({
                        where: { id: productId },
                        data: {
                            status:  'Sold',
                            guaranteeId: newGuarantee.id
                        }
                    });
                }else{
                    await transaction.products.update({
                        where: { id: productId },
                        data: {
                            status:  selectedSection || 'Sold',
                            guaranteeId: newGuarantee.id
                        }
                    });
                }

            }));

            await transaction.userGuaranteeSequence.update({
                where: { userId },
                data: { lastSeq: newSeq }
            });

            await transaction.userClientSequence.update({
                where: { userId },
                data: { lastSeq: newSeqClient },
            });
            codeC = newGuarantee.clientCode;  // Change this line
            return newGuarantee;
        });
        res.status(200).json({
            message: 'Guarantee created successfully',
            redirect: '/jewelry',
            id: formattedGuaranteeId,
            codeClient : codeC
        });
    } catch (error) {
        console.error('Error creating guarantee:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
