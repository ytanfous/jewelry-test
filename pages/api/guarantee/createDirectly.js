import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let formattedGuaranteeId = '';

    try {
        let { name, phone, rows, price, userId,note,codeClient } = req.body;

        if (!rows || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Ensure price is a valid number (convert to integer if it's a string)
        if (!price || isNaN(price)) {
            price = 0;  // Default to 0 if price is missing or not a number
        } else {
            price = parseInt(price, 10);  // Convert price to an integer
        }

        const result = await prisma.$transaction(async (transaction) => {
            // Find or create user guarantee sequence
            let userGuaranteeSequence = await transaction.userGuaranteeSequence.findUnique({
                where: { userId },
            });

            if (!userGuaranteeSequence) {
                userGuaranteeSequence = await transaction.userGuaranteeSequence.create({
                    data: {
                        userId,
                        lastSeq: 0,
                    },
                });
            }

            const newSeq = userGuaranteeSequence.lastSeq + 1;

            let userClientSequence = await transaction.userClientSequence.findUnique({
                where: { userId },
            });

            if (!userClientSequence) {
                userClientSequence = await transaction.userClientSequence.create({
                    data: {
                        userId,
                        lastSeq:0 ,
                    },
                });
            }
            let newSeqClient = userClientSequence.lastSeq ;

            let client = null;
            let clientCode = codeClient || null;

            if (clientCode) {
                client = await transaction.client.findUnique({
                    where: { clientCode },
                });
            }


            if (!client && !clientCode) {
                // Create new client if clientCode is empty
                newSeqClient = userClientSequence.lastSeq + 1;
                client = await transaction.client.create({
                    data: {
                        userId,
                        name, phone,

                        clientCode: `C-${userId}00${newSeqClient}`,
                    },
                });
                clientCode = client.clientCode;
            }
            // Create new guarantee
            const selectedComponent = 'Cash';
            if (selectedComponent === 'Cash') {
                formattedGuaranteeId = `ES-${userId}00${newSeq}`;
            }

            const newGuarantee = await transaction.guarantee.create({
                data: {
                    name,
                    phone,
                    selectedComponent,
                    clientCode: clientCode || null,
                    status: 'Active',
                    userId,
                    note,
                    price,
                    formattedGuaranteeId,
                },
            });

            // Update products in a single query
            await transaction.products.updateMany({
                where: {
                    code: {
                        in: rows, // Match rows in the `code` field
                    },
                    userId,
                },
                data: {
                    status: 'Sold',
                    guaranteeId: newGuarantee.id,
                },
            });
            await transaction.guaranteeHistory.create({
                data: {
                    guaranteeId: newGuarantee.id,
                    amount: parseFloat(price).toFixed(2),
                    action: "Created",
                },
            });

            // Update guarantee sequence
            await transaction.userGuaranteeSequence.update({
                where: { userId },
                data: { lastSeq: newSeq },
            });
            await transaction.userClientSequence.update({
                where: { userId },
                data: { lastSeq: newSeqClient },
            });
            return newGuarantee;
        });

        // Return success response
        res.status(200).json({
            message: 'Guarantee created successfully',
            redirect: '/jewelry',
            id: formattedGuaranteeId,
        });
    } catch (error) {
        console.error('Error creating guarantee:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
