import prisma from "@/lib/prisma";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { code, id, userId, status } = req.body;
    console.log("Received status:", status);


    try {
        const product = await prisma.products.findFirst({
            where: {
                status: "Active",
                code,
                userId,
            },
        });

        if (product) {
            await prisma.products.update({
                where: {
                    id: product.id,
                },
                data: {
                    jewelerId: parseInt(id),
                    status,
                    date: new Date(),
                },
            });

            await prisma.transactionhistory.create({
                data: {
                    productId: product.id,
                    jewelerId: parseInt(id),
                    userId: product.userId,
                    status,
                    date: new Date(),
                },
            });

            return res.status(200).json({ message: `Product status updated to ${status}` });
        } else {
            const product = await prisma.products.findFirst({
                where: {
                    code,
                    userId,
                },
            });

            if (status === 'Active') {

                const updatedProduct = await prisma.products.update({
                    where: {id: product.id, userId},
                    data: {jewelerId: null, date: null, status: 'Active'},
                });

                await prisma.transactionhistory.create({
                    data: {
                        productId: product.id,
                        jewelerId: product.jewelerId,
                        userId: product.userId,
                        status: "Active",
                        date: new Date(),
                    },
                });

                return     res.status(200).json(updatedProduct);

            }

            if (status === 'Sold') {

                const updatedProduct = await prisma.products.update({
                    where: {id: product.id, userId},
                    data: {jewelerId: null, date: null, status: 'Sold'},
                });

                await prisma.transactionhistory.create({
                    data: {
                        productId: product.id,
                        jewelerId: product.jewelerId,
                        userId: product.userId,
                        status: "Sold",
                        date: new Date(),
                    },
                });
                return     res.status(200).json(updatedProduct);

            }


        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    } finally {
        await prisma.$disconnect();
    }
}
