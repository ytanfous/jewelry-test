import prisma from '@/lib/prisma';


export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const products = await prisma.products.findMany({
                select: {
                    createdAt: true,
                },
            });

            const countPerDay = {};

            products.forEach(product => {
                const createdAt = new Date(product.createdAt);
                const formattedDate = `${createdAt.getDate()}-${createdAt.getMonth() + 1}-${createdAt.getFullYear()}`;

                countPerDay[formattedDate] = (countPerDay[formattedDate] || 0) + 1;
            });

            const labels = Object.keys(countPerDay);
            const productCount = Object.values(countPerDay);

            res.status(200).json({ labels, productCount });
        } catch (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({ error: 'Error fetching products' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}