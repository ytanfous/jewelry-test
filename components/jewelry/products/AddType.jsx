import React, { useState } from 'react';

function AddType({ userId }) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const addElement = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/type`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, userId: userId }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Type added:', data);
                window.location.reload();
            } else {
                setIsLoading(false);
                console.error('Error adding type:', response.statusText);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error adding element:', error);
        }
    };

    return (
        <div className="flex gap-2 mb-4 align-middle ">
            <div className="md:w-2/3">
                <input
                    className="px-5 py-3 appearance-none border-2 border-blue-200 rounded-xl w-full text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Entrez le nom du Modèle"
                />
            </div>
            <button
                onClick={addElement} disabled={isLoading}
                className="rounded-xl bg-blue-600 disabled:bg-gray-200  px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-blueSecondary/50"
            >
                Ajouter
            </button>
        </div>
    );
}

export default AddType;
