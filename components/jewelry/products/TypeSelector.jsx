import React, {useState} from 'react';

function TypeSelector({types, onSelect}) {
    const [selectedType, setSelectedType] = useState(null);

    const handleTypeClick = (type) => {
        if (selectedType && selectedType.id === type.id) {
            // Deselect if the selected type is clicked again
            setSelectedType(null);
            onSelect(null); // Optionally pass null to onSelect to inform the parent
        } else {
            // Select the clicked type
            setSelectedType(type);
            onSelect(type); // Pass the selected type to the parent
        }
    };
    return (
        <div className="flex flex-wrap justify-center gap-1">
            {types.map((type) => (
                <button
                    key={type.id}
                    type="button"
                    className={`font-medium rounded-lg text-[18px] w-24 h-16 p-2 mb-2 focus:outline-none ${
                        selectedType && selectedType.id === type.id ? 'bg-yellow-100 shadow-xl' : 'bg-blue-200 hover:bg-blue-400 focus:ring-4 focus:ring-blue-300'
                    }`}
                    onClick={() => handleTypeClick(type)}
                >
                    {type.value || type.name}
                </button>
            ))}
        </div>
    );
}

export default TypeSelector;
