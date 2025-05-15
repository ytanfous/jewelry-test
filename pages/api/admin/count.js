import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the start of the day

        // Get the total counts for users, products, auctions, and orders
        const userCount = await prisma.user.count();
        const productCount = await prisma.products.count();
        const auctionCount = await prisma.auction.count();
        const orderCount = await prisma.order.count();

        // Fetch all connection histories for today
        const todayConnections = await prisma.connectionhistory.findMany({
            where: {
                loginTime: {
                    gte: today,
                },
                user: {
                    type: {
                        not: 'admin',
                    },
                },
            },
            select: {
                userId: true,
            },
        });
        // Use a Set to get distinct user IDs
        const distinctUserIds = new Set(todayConnections.map(conn => conn.userId));
        const connectedUsersToday = distinctUserIds.size; // Get the count of distinct users

        // Send the response with all counts
        res.status(200).json({
            users: userCount,
            products: productCount,
            auctions: auctionCount,
            orders: orderCount,
            connectedUsersToday: connectedUsersToday, // Add the distinct users count
        });
    } catch (error) {
        console.error('Error fetching counts:', error);
        res.status(500).json({ error: 'Failed to fetch counts' });
    }
}
