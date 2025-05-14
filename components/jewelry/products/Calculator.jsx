import React from 'react';

function Calculator({value, onChange}) {
    const handleButtonClick = (symbol) => {
        if (symbol === 'C') {
            onChange('0');
        } else if (symbol === 'DEL') {
            onChange((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
        } else if (symbol === '.') {
            onChange((prev) => (prev.includes('.') ? prev : prev + symbol));
        } else if (value.length < 8) {
            onChange((prev) => (prev === '0' ? symbol : prev + symbol));
        }
    };

    return (
        <div
            className="w-full mx-auto rounded-xl shadow text-gray-800 relative overflow-hidden"
            style={{maxWidth: '300px'}}>
            <div className="w-full h-24 text-black flex bg-blue-50 items-end mb-0.5 text-right">
                <div className="w-full py-5 px-6 text-6xl font-thin">{value}</div>
            </div>
            <div className="w-full  bg-blue-200">
                <div className="grid grid-cols-4 ">
                    {['1', '2', '3', 'C', '4', '5', '6', 'DEL', '7', '8', '9', '.', '0'].map((symbol) => (
                        <button
                            key={symbol}
                            className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                            style={{width: '75px', height: '75px'}}
                            onClick={() => handleButtonClick(symbol)}
                        >
                            {symbol}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Calculator;
