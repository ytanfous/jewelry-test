import React from 'react';

function StateCheck({ id, value, setOrders }) {
    async function handleChangeStatus(id, status) {
        try {
            const response = await fetch(`/api/orders/updateStatus`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status }),
            });
            if (response.ok) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === id ? { ...order, status } : order
                    )
                );
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
                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer focus:ring-2"
            />
        </div>
    );
}

export default StateCheck;
