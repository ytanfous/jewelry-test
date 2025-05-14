import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const { userId, code } = req.query;

    if (req.method === 'GET') {
        if (!userId || !code) {
            console.error('Missing parameters: userId or code');
            return res.status(400).json({ message: 'Both userId and product code are required' });
        }

        try {
            const jeweler = await prisma.jeweler.findFirst({
                where: {
                    userId: parseInt(userId, 10), // Ensure userId is an integer
                    Products: {
                        code: { code }, // Ensure Products has this code
                    },
                },
                include: {
                    Products: true, // Include associated product details
                },
            });

            if (!jeweler) {
                console.warn(`Jeweler not found for userId: ${userId}, code: ${code}`);
                return res.status(404).json({ message: 'Jeweler not found for the provided userId and product code' });
            }

            console.log('Jeweler found:', jeweler);
            res.status(200).json(jeweler);
        } catch (error) {
            console.error('Error fetching jeweler:', error);
            res.status(500).json({ message: 'Failed to fetch jeweler' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
