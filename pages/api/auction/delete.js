import fs from 'node:fs';
import path from 'path';

import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const {id} = req.query;
        try {
            const auction = await prisma.auction.findUnique({
                where: {
                    id: parseInt(id),
                },
            });
            if (!auction) {
                return res.status(404).json({message: 'Auction not found'});
            }

            // Delete associated images
            const pictureNames = JSON.parse(auction.pictures);
            for (const pictureName of pictureNames) {
                const imagePath = path.join(process.cwd(), pictureName);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Delete the auction
            await prisma.auction.delete({
                where: {
                    id: parseInt(id),
                },
            });
            res.status(200).json({message: 'Auction deleted'});
        } catch (error) {
            res.status(500).json({message: 'Failed to delete auction'});
        } finally {
            await prisma.$disconnect();
        }
    } else {
        res.status(405).json({message: 'Method Not Allowed'});
    }
}
