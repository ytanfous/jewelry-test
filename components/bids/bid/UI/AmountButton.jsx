import React from 'react';

function AmountButton({ selectedAmount, handleAmountClick, amount }) {
    return (
        <button
            type="button"
            className={`w-16 h-12 ${selectedAmount === amount ? 'bg-amber-200' : 'bg-amber-100'} border-2 border-white hover:border-gray-800 rounded-2xl shrink-0`}
            onClick={() => handleAmountClick(amount)}>
            {amount}
        </button>
    );
}

export default AmountButton;