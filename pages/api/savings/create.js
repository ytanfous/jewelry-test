import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, amount, location, name, phone, code,note } = req.body;
        let formattedSavingId  = '';
        let codeC;
        let cAt;
        // Begin the transaction
        const result = await prisma.$transaction(async (transaction) => {
            // Fetch or create user saving sequence
            let userSavingSequence = await transaction.userSavingSequence.findUnique({
                where: { userId },
            });

            if (!userSavingSequence) {
                userSavingSequence = await transaction.userSavingSequence.create({
                    data: {
                        userId,
                        lastSeq: 0,
                    },
                });
            }

            // Fetch or create user client sequence
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

            const newSeq = userSavingSequence.lastSeq + 1;
            let newSeqClient = userClientSequence.lastSeq;
             formattedSavingId = `SA${userId}00${newSeq}`;

            // Handle the client
            let client = null;
            let clientCode = code || null;

            if (clientCode) {
                // Try to find client if clientCode is provided
                client = await transaction.client.findUnique({
                    where: { clientCode },
                });
            }

            if (!client && !clientCode) {
                // If no client and no code, create a new client
                newSeqClient = userClientSequence.lastSeq + 1;
                client = await transaction.client.create({
                    data: {
                        userId,
                        location,
                        name,
                        phone,
                        clientCode: `C-${userId}00${newSeqClient}`,
                    },
                });
                clientCode = client.clientCode; // Set the clientCode for the order
            }

            // Create a new saving entry
            const newSaving = await transaction.saving.create({
                data: {
                    amount: parseInt(amount),
                    location:location ||"",
                    name: name||"",
                    phone:phone||"",
                    note:   note||"",
                    status: true,
                    userId,
                    clientCode: clientCode || null,
                    client: client ? { connect: { id: client.id } } : undefined,
                    UserSavingSequence: formattedSavingId,
                },
            });

            // Create history record for the saving creation
            await transaction.savinghistory.create({
                data: {
                    action: 'create',
                    savingId: newSaving.id,
                    userId,
                    details: `${amount} Dt`,
                },
            });

            // Update user saving sequence and client sequence
            await transaction.userSavingSequence.update({
                where: { userId },
                data: { lastSeq: newSeq },
            });

            await transaction.userClientSequence.update({
                where: { userId },
                data: { lastSeq: newSeqClient },
            });
            codeC = newSaving.clientCode;
            cAt = newSaving.createdAt;
            return newSaving; // Return the new saving record
        });

        // Return success message and redirect URL
        res.status(200).json({
            message: 'Product created successfully',
            redirect: '/jewelry/saving/listSavings',
            id: formattedSavingId,
            codeClient : codeC,
            createdAt: cAt ,
        });
    } catch (error) {
        console.error('Error creating saving:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        // Disconnect Prisma client
        await prisma.$disconnect();
    }
}
