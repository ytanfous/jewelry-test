import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const { userId } = req.query; // Assume you pass userId as a query parameter

    try {
        // Fetch user's basic profile details
        const userProfile = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                auctions: true, // Fetch related auctions
                products: true, // Fetch related products
                ConnectionHistory: {
                    orderBy: {
                        loginTime: 'desc',
                    },
                },
                TransactionHistory: {
                    orderBy: {
                        date: 'desc',
                    },
                    include: {
                        product: true,
                        jeweler: true,
                    },
                },
            },
        });

        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send the fetched user profile data as a response
        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
}
