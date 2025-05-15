import React from 'react';

function Input({label, id, classes, ...props}) {
    return (<div className={classes}>
        <label className="block tracking-wide text-gray-700 text-[16px] text-nowrap  font-bold mb-2"
               htmlFor={id}>
            {label}
        </label>
        <input
            className="appearance-none block w-full  text-black border border-amber-500
            rounded-lg  focus:ring-black focus:border-2 focus:border-black  py-3 px-4 mb-3 leading-tight focus:outline-none bg-amber-50"
            id={id} {...props}/>
    </div>);
}

export default Input;