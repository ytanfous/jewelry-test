import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import serverPath from '@/utils/serverPath';
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Set this to the size you need
        },
    },
};

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, phone, image, storeName, userId } = req.body;

    try {
        let imageURL = null;
        if (image) {
            const imagesDir = serverPath('pages/api/images/jeweler');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
            }

            const mimeType = image.type; // e.g., 'image/jpeg'
            const extension = mimeType.split('/')[1]; // Extracts 'jpeg'
            const fileName = `${Math.floor(Math.random() * 10000000)}.${extension}`;
            const filePath = path.join(imagesDir, fileName);

            const base64Data = image.dataURL.split(',')[1];
            const bufferImage = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filePath, bufferImage);

            imageURL = `/api/images/jeweler/${fileName}`;
        }

        const jeweler = await prisma.jeweler.create({
            data: {
                name,
                phone: phone || null,
                storeName,
                image: imageURL,
                userId,
            },
        });

        res.status(200).json({
            message: 'Jeweler created successfully',
            redirect: '/jewelry',
            imageUrl: imageURL,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the jeweler' });
    } finally {
        await prisma.$disconnect();
    }
}
