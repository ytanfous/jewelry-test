import React from 'react';
import Image from "next/image";
import Link from "next/link";

function BidItem({id, title, carat, weight, currentPrice, type, pictures}) {
    return (
        <article
            className="flex flex-col max-w-sm bg-white border border-yellow-300 h-full rounded-lg  p-2 justify-between ">
            {pictures.length > 0 && (
                <Image
                    src={pictures[0]} // Assuming pictures is an array of image URLs
                    alt={title}
                    width={600}
                    height={400}
                    className="rounded-t-lg object-contain h-40"
                />
            )}
            <div>
                <div className="p-5">
                    <h5 className="text-xl font-semibold tracking-tight text-gray-900 text-center">{title}</h5>
                    <div className="flex gap-4 flex-wrap justify-around mt-2  bg-amber-100 p-2 ">
                        <div>
                            <h6 className="font-semibold ">
                                Type de bijoux
                            </h6>
                            <p className="font-normal text-gray-700 ">
                                {type}
                            </p>
                        </div>
                        <div>
                            <h6 className="font-semibold">
                                Carat
                            </h6>
                            <p className="font-normal text-gray-700 ">
                                {carat} k
                            </p>
                        </div>
                        <div>
                            <h6 className="font-semibold">
                                Poids
                            </h6>
                            <p className="font-normal text-gray-700 ">
                                {weight} g

                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between p-5 flex-wrap gap-5 ">
                    <span className="text-3xl font-bold text-gray-900"> {currentPrice} Dt</span>
                    <Link href={`auction/${id}`}
                          className="flex justify-between whitespace-nowrap text-white bg-amber-500 hover:bg-amber-800 focus:ring-4 focus:outline-none
                   focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
                        <svg className="w-[20px] h-[20px] mr-1 text-gray-800 dark:text-white" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"
                                  d="M5 12h14m-7 7V5"/>
                        </svg>

                        <span className=" text-[18px]"> Détails</span>
                    </Link>
                </div>
            </div>

        </article>
    );
}

export default BidItem;