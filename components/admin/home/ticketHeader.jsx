import React, {useState} from 'react';
import {BsCart2} from "react-icons/bs";

function TicketHeader({ icon: Icon, productName, quantity,size="w-1/4" }) {
    const [hover, setHover] = useState(false);
    const validSizes = {
        "w-1/6": "xl:w-1/6",
        "w-1/4": "xl:w-1/4",
        "w-1/3": "xl:w-1/3",
        "w-1/2": "xl:w-1/2",
        "w-full": "xl:w-full",
    };

    // Resolve the size class
    const sizeClass = validSizes[size] || "xl:w-1/4";

    return (
        <div  className={`w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 ${sizeClass}`}
             onMouseEnter={() => setHover(true)}
             onMouseLeave={() => setHover(false)}>
            <div
                className={`relative flex flex-col min-w-0 break-words h-20 shadow-md rounded-2xl bg-clip-border 
                 transition-transform duration-300 ease-in-out  ${hover ? `bg-gradient-to-tl from-blue-600 to-pink-300 ` : `bg-white`}`}>
                <div className="flex-auto p-4">
                    {hover && (

                        <div className="flex flex-row justify-center align-middle -mx-3 ">

                            <div className="text-center">
                                <p className="mb-0  font-sans font-semibold leading-normal  text-white">{productName}</p>
                                <h5 className="mb-0 font-bold text-white">
                                    {quantity}

                                </h5>
                            </div>
                        </div>
                    )}
                    {!hover && (
                        <div className="flex flex-row -mx-3 ">

                            <div className="flex-none w-2/3 max-w-full px-3 transition-transform duration-300 ease-in-out ">
                                <div>
                                    <p className="mb-0 font-sans font-semibold leading-normal text-sm">{productName}</p>
                                    <h5 className="mb-0 font-bold">
                                        {quantity}

                                    </h5>
                                </div>
                            </div>
                            <div className="flex justify-end px-3  basis-1/3">
                                <div
                                    className="flex bg-white w-12 h-12 shadow-2xl items-center justify-center rounded-lg bg-gradient-to-tl from-blue-600 to-pink-300">
                                    <Icon className=" `w-12 h-12 text-2xl  text-white"/>
                                </div>
                            </div>
                        </div>

                    )}
                </div>
            </div>
        </div>
    );
}

export default TicketHeader;