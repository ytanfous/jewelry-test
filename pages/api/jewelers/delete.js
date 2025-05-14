import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import serverPath from '@/utils/serverPath';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { jewelerId } = req.body;

    try {
        if (!jewelerId) {
            return res.status(400).json({ message: 'Jeweler ID is required' });
        }

        // Fetch the jeweler and related data
        const jewelerToDelete = await prisma.jeweler.findUnique({
            where: { id: parseInt(jewelerId) }, // Change jewelerId to id
            include: {
                Products: true,
                TransactionHistory: true,
                Slaf: true,
                SalfHistory: true,
            },
        });

        if (!jewelerToDelete) {
            return res.status(404).json({ message: 'Jeweler not found' });
        }

        if (jewelerToDelete.image) {
            const imagesDir = serverPath('pages/api/images/jeweler');

            // Extract the file name from the existing image URL
            const oldImageFileName = jewelerToDelete.image.split('/').pop();
            const oldImagePath = path.join(imagesDir, oldImageFileName);

            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Delete "weslet" products associated with the jeweler
        await prisma.products.deleteMany({
            where: {
                jewelerId: parseInt(jewelerId),
                status: 'Weslet',
            },
        });

        // Set non-"weslet" products to `Active` and disassociate them from the jeweler
        await prisma.products.updateMany({
            where: {
                jewelerId: parseInt(jewelerId),
                NOT: { status: 'Weslet' }, // Exclude "weslet" products
            },
            data: {
                status: 'Active',
                jewelerId: null,
            },
        });

        // Delete associated `salfhistory` records first, as they reference `slafId`
        await prisma.salfhistory.deleteMany({
            where: {
                slafId: {
                    in: jewelerToDelete.Slaf.map((slaf) => slaf.id), // Use the `slaf` entries fetched above
                },
            },
        });

        // Delete associated `slaf` entries
        await prisma.slaf.deleteMany({
            where: {
                jewelerId: parseInt(jewelerId),
            },
        });

        // Now handle any other dependent records that might be referencing `jewelerId`
        await prisma.transactionhistory.deleteMany({
            where: {
                jewelerId: parseInt(jewelerId),
            },
        });

        // Finally, delete the jeweler
        await prisma.jeweler.delete({
            where: { id: parseInt(jewelerId) },
        });

        res.status(200).json({ message: 'Jeweler deleted successfully' });
    } catch (error) {
        console.error('Error deleting jeweler:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
}
