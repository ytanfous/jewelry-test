import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import serverPath from '@/utils/serverPath'; // Assuming this is the path to your serverPath utility
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Set this to the size you need
        },
    },
};
export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const jeweler = await prisma.jeweler.findUnique({
                where: { id: parseInt(id) },
            });
            res.json(jeweler);
        } catch (error) {
            console.error('Error fetching jeweler:', error);
            res.status(500).json({ message: 'Failed to fetch jeweler' });
        }
    } else if (req.method === 'PUT') {
        const { name, phone, imageUpdate, storeName, createdAt } = req.body;

        if (!name  || !createdAt ) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        let imageUrl = null;
        if (imageUpdate) {
            // Assuming image is base64-encoded
            const imagesDir = serverPath('pages/api/images/jeweler'); // Resolve server-side images directory
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
            }

            const extension = imageUpdate.name.split('.').pop();
            const fileName = `${Math.floor(Math.random() * 10000000)}.${extension}`;
            const filePath = path.join(imagesDir, fileName);

            const base64Data = imageUpdate.dataURL.split(',')[1];
            const bufferImage = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filePath, bufferImage);
            imageUrl = `/api/images/jeweler/${fileName}`;
        }

        try {
            // Find the existing jeweler to check if there's an old image to delete
            const existingJeweler = await prisma.jeweler.findUnique({
                where: { id: parseInt(id) },
            });

            if (existingJeweler && existingJeweler.image && imageUrl) {
                const imagesDir = serverPath('pages/api/images/jeweler');

                // Extract the file name from the existing image URL
                const oldImageFileName = existingJeweler.image.split('/').pop();
                const oldImagePath = path.join(imagesDir, oldImageFileName);

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }


            const updatedJeweler = await prisma.jeweler.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    phone : phone || null,
                    storeName : storeName || null,
                    createdAt,
                    ...(imageUrl && { image: imageUrl }),
                },
            });

            res.json(updatedJeweler);
        } catch (error) {
            console.error('Error updating jeweler:', error);
            res.status(500).json({ message: 'Failed to update jeweler' });
        } finally {
            await prisma.$disconnect();
        }
    } else if (req.method === 'DELETE') {
        try {
            // Delete the jeweler's image if it exists before deleting the jeweler
            const existingJeweler = await prisma.jeweler.findUnique({
                where: { id: parseInt(id) },
            });

            if (existingJeweler && existingJeweler.image) {
                const imagesDir = serverPath('pages/api/images/jeweler');
                const oldImagePath = path.join(imagesDir, existingJeweler.image.split('/').pop());
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Delete the old image
                }
            }

            await prisma.jeweler.delete({
                where: { id: parseInt(id) },
            });
            res.status(204).end(); // No content response
        } catch (error) {
            console.error('Error deleting jeweler:', error);
            res.status(500).json({ message: 'Failed to delete jeweler' });
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
