import {hash} from 'bcrypt';
import prisma from '@/lib/prisma';
import {signOut} from 'next-auth/react'; // Import signOut function from next-auth/react

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({message: 'Method not allowed'});
    }

    const {userId, password, confirmPassword, location, email, phone, CompanyName, name} = req.body;

    // Check if passwords match
    if (password && password !== confirmPassword) {
        return res.status(400).json({message: 'Passwords do not match'});
    }

    try {
        // Prepare the update object
        const updateData = {location, CompanyName, email, phone, name};


        if (password) {
            const hashedPassword = await hash(password, 10);
            updateData.password = hashedPassword;
            // Sign out the user if password is change

        }


        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: updateData,
        });

        if (!password) {
            console.log(password);
            console.log(confirmPassword);
            return res.status(200).json({
                message: 'User updated successfully',
                redirect: '/jewelry',
                user: updatedUser
            });
        } else {

            res.status(200).json({message: 'User updated successfully', redirect: '/'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error updating user'});
    }
}
