import prisma from "@/lib/prisma";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { jewelerId, userId, model, origin, carat, weight } = req.body;

    try {
        // Validate required fields
        if (!jewelerId || !userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Fetch or create a userProductSequence for the user
        const userSequence = await prisma.userProductSequence.upsert({
            where: { userId: userId },
            create: {
                userId: userId,
                lastSeq: 1, // Start sequence from 1 if it doesn't exist
            },
            update: {
                lastSeq: { increment: 1 }, // Increment sequence
            },
        });

        // Generate the product code using the updated sequence
        const productCode = `W${userId}00${userSequence.lastSeq}`;

        // Create the new product
        const newProduct = await prisma.products.create({
            data: {
                code: productCode,
                model: model ?? null,
                origin: origin ?? null,
                carat: carat ?? null,
                weight: weight ?? null,
                status: "WESLET",
                userId: parseInt(userId),
                jewelerId: parseInt(jewelerId),
                date: new Date(),
            },
        });

        // Record the transaction in the history
        await prisma.transactionhistory.create({
            data: {
                productId: newProduct.id,
                jewelerId: parseInt(jewelerId),
                userId: parseInt(userId),
                status: "WESLET",
                date: new Date(),
            },
        });

        return res.status(201).json({
            message: "Product created successfully",
            redirect: '/jewelry',
            newProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    } finally {
        await prisma.$disconnect();
    }
}
