import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    try {
        const products = await prisma.products.findMany({
            select: {
                createdAt: true,
            },
        });

        const auctions = await prisma.auction.findMany({
            select: {
                createdAt: true,
            },
        });

        const countPerDay = {};

        // Process product creation dates
        products.forEach(product => {
            const createdAt = new Date(product.createdAt);
            const formattedDate = `${createdAt.getDate()}-${createdAt.getMonth() + 1}-${createdAt.getFullYear()}`;

            countPerDay[formattedDate] = {
                products: (countPerDay[formattedDate]?.products || 0) + 1,
                auctions: countPerDay[formattedDate]?.auctions || 0,
            };
        });

        // Process auction creation dates
        auctions.forEach(auction => {
            const createdAt = new Date(auction.createdAt);
            const formattedDate = `${createdAt.getDate()}-${createdAt.getMonth() + 1}-${createdAt.getFullYear()}`;

            countPerDay[formattedDate] = {
                products: countPerDay[formattedDate]?.products || 0,
                auctions: (countPerDay[formattedDate]?.auctions || 0) + 1,
            };
        });

        // Prepare response data
        const labels = Object.keys(countPerDay);
        const productCount = Object.values(countPerDay).map(count => count.products);
        const auctionCount = Object.values(countPerDay).map(count => count.auctions);

        // Send the response
        res.status(200).json({ labels, productCount, auctionCount });
    } catch (error) {
        console.error('Error fetching creation dates:', error);
        res.status(500).json({ message: 'Error fetching creation dates' });
    }
}
