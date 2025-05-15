import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const {id} = req.query;
        const {
            title,
            carat,
            weight,
            type,
            description,
            startPrice,
            currentPrice,
            nameBid,
            pictures,
            timer,
            status,
            userId,
        } = req.body;

        try {
            const updateData = {
                title,
                carat,
                weight,
                type,
                description,
                startPrice,
                currentPrice,
                nameBid,
                pictures,
                timer,
                status,
            };

            // Conditionally add the users connect data if userId is provided
            if (userId) {
                updateData.users = {
                    connect: {id: parseInt(userId)}, // Connect user to auction
                };
            }

            const updatedAuction = await prisma.auction.update({
                where: {id: parseInt(id)},
                data: updateData,
                include: {
                    users: true, // Include users to count them
                },
            });

            const userCount = updatedAuction.users.length;

            // Update the participate field with the user count
            const finalUpdatedAuction = await prisma.auction.update({
                where: {id: parseInt(id)},
                data: {
                    participate: userCount,
                },
            });

            res.status(200).json({message: 'Auction updated successfully', redirect: '/auction/listAuction'});
        } catch (error) {
            console.error('Error updating auction:', error);
            res.status(500).json({message: 'Failed to update auction'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({message: 'Method Not Allowed'});
    }
}
