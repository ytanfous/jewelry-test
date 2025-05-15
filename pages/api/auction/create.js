import fs from 'node:fs';
import path from 'path';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({message: 'Method Not Allowed'});
    }

    const {title, carat, weight, type, description, startPrice, currentPrice, nameBid, pictures} = req.body;
    const pictureNames = [];
    const imagesDir = path.join(process.cwd(), 'public/auction/images/');

    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, {recursive: true});
    }

    for (const picture of pictures) {
        const extension = picture.name.split('.').pop();
        const fileName = `${Math.floor(Math.random() * 10000000)}.${extension}`;
        const filePath = path.join(imagesDir, fileName);

        const base64Data = picture.dataURL.split(',')[1];
        const bufferImage = Buffer.from(base64Data, 'base64');

        fs.writeFileSync(filePath, bufferImage);

        pictureNames.push(`/auction/images/${fileName}`);
    }

    const status = "Active"
    try {
        const auction = await prisma.auction.create({
            data: {
                title,
                carat,
                weight,
                type,
                description,
                startPrice,
                currentPrice,
                nameBid: '-',
                status,
                pictures: JSON.stringify(pictureNames),
                participate: 0
            },
        });
        res.status(200).json({message: 'Auction created successfully', redirect: '/auction'});

    } catch (error) {
        console.error('Error creating auction:', error);
        res.status(500).json({message: 'Failed to create auction'});
    } finally {
        await prisma.$disconnect();
    }
}