import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const carat = await prisma.carat.findMany();

        const sortedCarat = carat.sort((a, b) => a.value - b.value);

        const caratAsString = sortedCarat.map(item => ({
            ...item,
            value: String(item.value), // Assuming the carat value is in the 'value' field
        }));

        res.status(200).json(caratAsString);
    } catch (error) {
        console.error('Error fetching carat:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
