import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        let { userId, jewelerId, amount, note, unit } = req.body;

        if (!amount){
            amount = "0"
        }
        const result = await prisma.$transaction(async (transaction) => {
            let userSlafSequence = await transaction.userSlafSequence.findUnique({
                where: { userId },
            });

            if (!userSlafSequence) {
                userSlafSequence = await transaction.userSlafSequence.create({
                    data: {
                        userId,
                        lastSeq: 0,
                    },
                });
            }

            const newSeq = userSlafSequence.lastSeq + 1;
            const formattedCode = `SL${userId}00${newSeq}`;

            const newSlaf = await transaction.slaf.create({
                data: {
                    userId,
                    jewelerId,
                    amount,
                    note,
                    unit,
                    code: formattedCode,
                },
            });

            // Log the creation in SalfHistory
            await transaction.salfhistory.create({
                data: {
                    slafId: newSlaf.id,
                    userId,
                    jewelerId,
                    action: 'create',
                    value: amount, // Log the initial amount
                },
            });

            // Update the sequence
            await transaction.userSlafSequence.update({
                where: { userId },
                data: { lastSeq: newSeq },
            });

            return newSlaf;
        });

        res.status(200).json({
            message: 'Slaf created successfully',
            slaf: result,
        });
    } catch (error) {
        console.error('Error creating Slaf:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
