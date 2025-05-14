import prisma from '@/lib/prisma';

function adjustTableData(tableData, amountChange, operation) {
    let remainingChange = parseFloat(amountChange);

    if (operation === "minus") {
        const totalAmount = tableData.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

        // Check if amountChange exceeds total available
        if (remainingChange > totalAmount) {
            throw new Error("Impossible de déduire plus que le montant total disponible");
        }
        for (let entry of tableData) {
            let currentAmount = parseFloat(entry.amount);
            if (remainingChange <= 0) break;

            if (remainingChange >= currentAmount) {
                // Deduct entire amount
                entry.amount = "0.00";
                remainingChange -= currentAmount;

                // Mark as paid if amount is 0
                entry.checkNumber = "paid"; // Set checkNumber to "paid"
                entry.status = true; // Set status to true when paid
            } else {
                // Deduct partial amount
                entry.amount = (currentAmount - remainingChange).toFixed(2);
                remainingChange = 0;
                // Mark as pending if amount is not 0
                entry.checkNumber = "pending";
                entry.status = false;
            }
        }
    } else if (operation === "plus") {
        // Find the first pending entry
        const pendingEntry = tableData.find(entry => entry.checkNumber === "pending");

        if (pendingEntry) {
            // Add the amount to the first pending entry
            let currentAmount = parseFloat(pendingEntry.amount);
            pendingEntry.amount = (currentAmount + remainingChange).toFixed(2);
            pendingEntry.checkNumber = "pending";
            pendingEntry.status = false;
        } else {
            // All entries are paid, create a new one with date +1 month
            const lastEntry = tableData[tableData.length - 1];
            const lastDate = new Date();
            const newDate = new Date(lastDate.setMonth(lastDate.getMonth() + 1));

            const newEntry = {
                amount: remainingChange.toFixed(2),
                checkNumber: "pending",
                status: false,
                date: newDate, // Format as YYYY-MM-DD
                // Include other necessary fields from your schema
                guaranteeId: lastEntry.guaranteeId,
                // Add any other required fields here
            };

            tableData.push(newEntry);
        }
    }

    return tableData;
}


export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, amountChange, operation, checkNumber, ...otherFields } = req.body;

        if (!id || !amountChange || !operation) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const guaranteeId = Number(id);

        // Fetch the existing guarantee record with tableData
        const existingGuarantee = await prisma.guarantee.findUnique({
            where: { id: guaranteeId },
            include: { tableData: true }, // Include facilitated entries
        });

        if (!existingGuarantee) {
            return res.status(404).json({ error: "Guarantee not found" });
        }

        // Adjust the tableData based on the operation and checkNumber
        let updatedTableData;

        try {
            updatedTableData = adjustTableData(existingGuarantee.tableData, amountChange, operation);
        } catch (error) {
            return res.status(400).json({
                error: error.message,
                details: "The amount you're trying to deduct exceeds the available balance"
            });
        }

        // Calculate the new advance amount
        const currentAdvance = parseFloat(existingGuarantee.advance || 0);
        const newAdvance = operation === "plus"
            ? currentAdvance - parseFloat(amountChange)
            : currentAdvance + parseFloat(amountChange);

        // Ensure the advance amount is not negative
        const updatedAdvance = Math.max(newAdvance, 0).toFixed(2);

        // Start transaction
        const updatedGuarantee = await prisma.$transaction(async (transaction) => {
            const monthsCount = updatedTableData.length;

            // Update the guarantee's advance and other fields
            const updatedGuarantee = await transaction.guarantee.update({
                where: { id: guaranteeId },
                data: {
                    advance: updatedAdvance,
                    months: String(monthsCount),
                    ...otherFields,
                    updatedAt: new Date(),
                },
            });

            // Update the facilitated entries
            for (const entry of updatedTableData) {
                if (entry.id) {
                    // Existing entry - update it
                    await transaction.facilitated.update({
                        where: { id: entry.id },
                        data: {
                            amount: entry.amount,
                            status: entry.status,
                            checkNumber: entry.checkNumber,
                        },
                    });
                } else {
                    // New entry - create it
                    await transaction.facilitated.create({
                        data: {
                            amount: entry.amount,
                            status: entry.status,
                            checkNumber: entry.checkNumber,
                            date: entry.date,
                            guaranteeId: entry.guaranteeId,
                            // Include any other required fields
                        },
                    });
                }
            }

            // Log the change in history
            await transaction.guaranteeHistory.create({
                data: {
                    guaranteeId: guaranteeId,
                    amount: operation === "plus"
                        ?  parseFloat(amountChange).toFixed(2)
                        : - parseFloat(amountChange).toFixed(2),
                    action: "Update",
                    timestamp: new Date(),
                },
            });

            return updatedGuarantee;
        });

        return res.status(200).json({ message: "Guarantee updated successfully", data: updatedGuarantee });

    } catch (error) {
        console.error("Error updating guarantee:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}