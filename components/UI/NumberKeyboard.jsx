import React from 'react';

const NumberKeyboard = ({onKeyPress}) => {
    const handleClick = (value, event) => {
        event.stopPropagation();
        onKeyPress(value);
    };

    return (
        <div className="number-keyboard w-full  bg-blue-50 m-2 rounded">
            <div className="grid grid-cols-3 ">
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('1', e)}>1
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('2', e)}>2
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('3', e)}>3
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('4', e)}>4
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('5', e)}>5
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('6', e)}>6
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('7', e)}>7
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('8', e)}>8
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('9', e)}>9
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('.', e)}>.
                </button>

                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('0', e)}>0
                </button>
                <button
                    className="w-full h-16 outline-none focus:outline-none hover:bg-indigo-700 hover:bg-opacity-20   text-xl"
                    onClick={(e) => handleClick('del', e)}>DEL
                </button>
            </div>
        </div>
    );
};

export default NumberKeyboard;
