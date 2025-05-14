import prisma from '@/lib/prisma';
import serverPath from "@/utils/serverPath";
import fs from "fs";
import path from "path";
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Set this to the size you need
        },
    },
};
export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const {id, price,note,advance, image} = req.body;

        try {

            let imageUrl = null;
            if (image) {
                // Assuming image is base64-encoded
                const imagesDir = serverPath('pages/api/images/orders'); // Resolve server-side images directory
                if (!fs.existsSync(imagesDir)) {
                    fs.mkdirSync(imagesDir, { recursive: true });
                }

                const extension = image.name.split('.').pop();
                const fileName = `${Math.floor(Math.random() * 10000000)}.${extension}`;
                const filePath = path.join(imagesDir, fileName);

                const base64Data = image.dataURL.split(',')[1];
                const bufferImage = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(filePath, bufferImage);
                imageUrl = `/api/images/orders/${fileName}`;
            }



            const existingOrders = await prisma.order.findUnique({
                where: {id: Number(id)},
            });
            if (!existingOrders) {
                return res.status(404).json({error: 'Orders not found'});
            }

            if (existingOrders && existingOrders.image && imageUrl) {
                const imagesDir = serverPath('pages/api/images/orders');

                // Extract the file name from the existing image URL
                const oldImageFileName = existingOrders.image.split('/').pop();
                const oldImagePath = path.join(imagesDir, oldImageFileName);

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            const updatedOrders = await prisma.order.update({
                where: {id: parseInt(id)},
                data: {price,note,advance,  ...(imageUrl && { image: imageUrl }),},
            });

            res.status(200).json(updatedOrders);
        } catch (error) {
            console.error('Error updating slaf:', error);
            res.status(500).json({error: 'Error updating slaf'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
