import React from 'react';

function InputGroup({
                        label,
                        name,
                        value,
                        onChange,
                        type = "text",
                        decoration,
                        className = "",
                        inputClassName = "",
                        decorationClassName = "",
                        disabled,
                    }) {

    return (
        <div className={`relative w-full rounded-lg overflow-hidden  shadow-sm ${className}`}>
            <input
                id={name}
                name={name}
                value={value}
                type={type}
                placeholder={label}
                aria-label={label}
                onChange={onChange}
                className={`peer block w-full p-3 pl-10 text-gray-600 border bg-amber-50 border-amber-500 rounded-lg focus:ring-0 focus:border-2 focus:border-black focus:outline-none ${
                    disabled ? "bg-gray-200" : ""
                } ${inputClassName}`}
                disabled={disabled}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600 pointer-events-none">
                {decoration}
            </div>
        </div>


    );
}

export default InputGroup;