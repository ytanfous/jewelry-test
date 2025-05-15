import React from 'react';

function ButtonTable({content, onClick, active, disabled}) {
    return (<button
        className={`flex flex-col cursor-pointer items-center justify-center border w-9 h-9 border-amber-200 text-sm font-normal transition-colors rounded-lg 
      ${active ? " bg-amber-400 text-white" : "text-amber-500"}
      ${!disabled ? " hover:bg-red-500 hover:text-white" : "text-amber-500 bg-gray-100 cursor-not-allowed"}`}
        onClick={onClick}
        disabled={disabled}>
        {content}
    </button>);
}

export default ButtonTable;