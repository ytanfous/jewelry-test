import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { type, id } = req.body;

        try {
            const updatedUser = await prisma.user.update({
                where: { id: parseInt(id, 10) }, // Ensures id is parsed correctly as an integer
                data: { type },
            });

            // Return the updated user data
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Unable to update user' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
