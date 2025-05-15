import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const {id} = req.query;

    if (req.method === 'GET') {
        try {
            const auction = await prisma.auction.findUnique({
                where: {id: parseInt(id)},
            });
            res.json(auction);
        } catch (error) {
            console.error('Error fetching auction:', error);
            res.status(500).json({message: 'Failed to fetch auction'});
        }
    } else if (req.method === 'PUT') {
        const {
            title,
            carat,
            weight,
            participate,
            type,
            description,
            startPrice,
            currentPrice,
            nameBid,
            pictures,
            timer,
            status,
            createdAt,
        } = req.body;
        try {
            const updatedAuction = await prisma.auction.update({
                where: {id: parseInt(id)},
                data: {
                    title,
                    carat,
                    weight,
                    type,
                    description,
                    startPrice,
                    currentPrice,
                    nameBid,
                    pictures,
                    participate,
                    timer,
                    status,
                    createdAt,
                },
            });
            res.json(updatedAuction);
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
