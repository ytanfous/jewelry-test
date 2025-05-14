import {compare} from "bcrypt";
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    const {userId, password} = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {id: userId},
        });

        if (user && await compare(password, user.password)) {
            return res.status(200).json({success: true});
        }

        return res.status(401).json({success: false, message: 'Invalid password'});
    } catch (error) {
        console.error('Error checking password:', error);
        res.status(500).json({success: false, message: 'Internal server error'});
    }
}
