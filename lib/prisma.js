import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add middleware to block updates for deleted products
prisma.$use(async (params, next) => {
    if (params.model === 'products' && (params.action === 'update' || params.action === 'updateMany')) {
        // Check if the product is being updated
        const where = params.args.where;

        // Find the product(s) being updated
        const products = await prisma.products.findMany({
            where,
        });

        // Check if any of the products have a status of 'deleted'
        const hasDeletedProduct = products.some(product => product.status === 'deleted');

        if (hasDeletedProduct) {
            throw new Error('Cannot update a deleted product');
        }
    }

    // Continue with the query
    return next(params);
});

export default prisma;