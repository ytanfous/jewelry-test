import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'Client ID is required' });
            }

            // Fetch the client by ID and include related orders, savings, and guarantees
            const client = await prisma.client.findUnique({
                where: {
                    id: Number(id),
                },
                include: {
                    orders: {
                        include: {
                            OrderHistory: true,
                        },
                    },
                    savings:  {
                include: {
                    SavingHistory: true,
                },
            },
                    guarantee: {
                        include: {
                            GuaranteeHistory: true, // Include related GuaranteeHistory
                            tableData: true, // Include related facilitated records (tableData)
                            rows: true,
                        },
                    }, // Include related guarantees
                },
            });

            if (!client) {
                return res.status(404).json({ error: 'Client not found' });
            }

            // Return the client data with related orders, savings, and guarantees
            res.status(200).json(client);
        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}