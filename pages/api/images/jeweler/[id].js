import fs from 'fs';
import path from 'path';
import serverPath from '@/utils/serverPath'; // Adjust the path based on your project structure

export default async function handler(req, res) {
    const {
        query: {id},
    } = req;

    try {
        const imagesDir = serverPath('pages/api/images/jeweler');
        const filePath = path.join(imagesDir, id);

        const fileContents = fs.readFileSync(filePath);
        const fileExtension = path.extname(filePath).toLowerCase();

        let contentType = '';
        if (fileExtension === '.png') {
            contentType = 'image/png';
        } else if (fileExtension === '.jpeg' || fileExtension === '.jpg') {
            contentType = 'image/jpeg';
        } else {
            throw new Error('Unsupported file type');
        }

        const imageBuffer = Buffer.from(fileContents, 'base64');
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': imageBuffer.length,
        });
        res.end(imageBuffer);
    } catch (error) {
        console.error(error);
        res.status(404).end();
    }
}
