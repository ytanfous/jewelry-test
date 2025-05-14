import React from 'react';

function StateCheck({ id, value, setFacilitated }) {
    async function handleChangeStatus(id, status) {
        try {
            const response = await fetch(`/api/guarantee/updateStatus`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status }),
            });
            if (response.ok) {
                setFacilitated(prevOrders => {
                    const updatedOrders = prevOrders.map(order =>
                        order.id === id ? { ...order, status } : order
                    );

                    // Remove the item from the list if the status is false (unchecked)
                    if (!status) {
                        return updatedOrders.filter(order => order.id !== id);
                    }
                    return updatedOrders;
                });
            } else {
                console.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error);
        }
    }

    return (
        <div className="flex justify-center gap-1">
            <input
                id="inline-checkbox"
                type="checkbox"
                checked={value}
                onChange={() => handleChangeStatus(id, !value)} // Toggle the status
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer focus:ring-2"
            />
        </div>
    );
}

export default StateCheck;
