"use clients"
import React, {useEffect, useState} from 'react';
import Image from "next/image";
import Modal from "@/components/bids/UI/Modal";
import AmountButton from "@/components/bids/bid/UI/AmountButton";
import InfoBlock from "@/components/bids/bid/UI/InfoBlock";
import {useSession} from "next-auth/react";
import {io} from "socket.io-client";
import useSocket from "@/app/hooks/useSocket";

let socket;

function Details({id}) {
    const [formData, setFormData] = useState({pictures: []});
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [image, setImage] = useState(0);
    const {data: session} = useSession();
    const [loading, setLoading] = useState(true);
    const socket = useSocket('http://localhost:3000');

    useEffect(() => {
        if (socket && id) {
            socket.emit('joinAuction', id);

            socket.on('currentPriceUpdate', (updatedPrice) => {
                console.log('currentPriceUpdate received:', updatedPrice);
                if (updatedPrice) {
                    setFormData((prevData) => ({
                        ...prevData,
                        currentPrice: updatedPrice[0],
                        nameBid: updatedPrice[1],
                    }));
                }
            });

            return () => {
                socket.off('currentPriceUpdate');
            };
        }
    }, [socket, id]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true); // Set loading state to true when fetching starts
                const response = await fetch(`/api/auction/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({...data, pictures: JSON.parse(data.pictures)});
                } else {
                    console.error('Failed to fetch auction data');
                }
            } catch (error) {
                console.error('Error fetching auction data:', error);
            } finally {
                setLoading(false); // Set loading state to false when fetching completes (whether successful or not)
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);


    if (loading) {
        return (
            <div
                className="flex items-center justify-center w-full h-screen border border-gray-200 rounded-lg ">
                <div role="status">
                    <svg aria-hidden="true"
                         className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-600"
                         viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"/>
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        ); // Display loading message or spinner while loading
    }

    async function handleUpdateCurrentPrice(id, currentPrice, add) {
        try {
            const response = await fetch(`/api/auction/update?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPrice: Number(currentPrice) + Number(add),
                    nameBid: session.user.username,
                    userId: session.user.id,
                }),
            });
            if (response.ok) {

                socket.emit('currentPriceUpdate', {
                    auctionId: id,
                    updatedPrice: [Number(currentPrice) + Number(add), session.user.username],
                });
                handleStopAdding();
            } else {
                alert('Failed to update auction status');
            }
        } catch (error) {
            console.error('Error updating auction status:', error);
            alert('Failed to update auction status');
        }
    }

    function handleStopAdding() {
        setModalIsOpen(false);
    }

    function handleStartAdding() {
        setModalIsOpen(true);
    }

    const handleAmountClick = (amount) => {
        setSelectedAmount(amount);
    };
    const handleInputChange = (event) => {
        setSelectedAmount(parseInt(event.target.value, 10));
    };

    function handleChangeImage(id) {
        setImage(id);

    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} à ${date.getHours()}:${date.getMinutes()}`;
    }

    return (
        <>
            <Modal open={modalIsOpen} onClose={handleStopAdding}>

                <div className="relative bg-white rounded-lg shadow ">
                    <button type="button" onClick={handleStopAdding}
                            className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                            data-modal-hide="popup-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500"> Es-tu sûr ?</h1>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment
                            ajouter {selectedAmount} Dt à l'enchère?</h3>
                        <button
                            data-modal-hide="popup-modal"
                            type="submit"
                            onClick={() => {
                                handleUpdateCurrentPrice(id, formData.currentPrice, selectedAmount);
                            }}
                            disabled={selectedAmount === null || isNaN(selectedAmount)}
                            className={`text-white focus:ring-4 ${
                                selectedAmount === null || isNaN(selectedAmount)
                                    ? 'bg-amber-600/85'
                                    : 'bg-amber-600 hover:bg-amber-900'
                            } focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center`}
                        >
                            Oui, je suis sûr
                        </button>
                        <button data-modal-hide="popup-modal" type="button" onClick={handleStopAdding}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg hover:bg-amber-200 bg-amber-100 focus:z-10 focus:ring-4 focus:ring-gray-100 ">No,
                            Annuler
                        </button>
                    </div>
                </div>
            </Modal>
            <div className="p-3 lg:max-w-7xl max-w-4xl mx-auto ">
                <div className="grid items-start grid-cols-1 lg:grid-cols-6 gap-6 p-6 ">
                    <div className="lg:col-span-3 w-full  top-0 text-center">
                        <div
                            className="px-4 py-10 relative flex  overflow-hidden align-center w-full h-96  overflow rounded-xl border border-yellow-600    justify-center align-middlerelative">
                            <Image src={formData.pictures && formData.pictures[image]} alt="Product"
                                   className=" rounded object-scale-down" width={1300}
                                   height={500}/>
                        </div>
                        <ul className="mt-6 flex flex-wrap justify-between align-middle gap-3  mx-auto ">
                            {formData.pictures && formData.pictures.map((e, index) => (
                                <li key={index}>
                                    <div
                                        className={`relative flex rounded-xl overflow-hidden align-center   overflow  cursor-pointer justify-center items-center object-scale-down  p-2 border-yellow-600   h-24 w-30  ${index === image ? `border-2` : `border`}`}
                                        onClick={() => handleChangeImage(index)}>
                                        <Image src={e} alt="Product Image Missing"
                                               className="cursor-pointer  p-1 "
                                               width={100} height={100}/>
                                    </div>

                                </li>))}
                        </ul>
                    </div>
                    <div className="lg:col-span-2 ">
                        <div className="border-b pb-3 border-b-amber-600">
                            <InfoBlock title="Participent" content={formData.participate}/>
                            <InfoBlock title="Type de bijoux" content={formData.type}/>
                            <InfoBlock title="Carat" content={`${formData.carat} k`}/>
                            <InfoBlock title="Poids" content={`${formData.weight} g`}/>
                            <InfoBlock title="Prix de lancement" content={`${formData.startPrice} Dt`}/>
                        </div>
                        <div className="border-b pb-3 border-b-amber-600">
                            <InfoBlock title="Dernière enchère" content={`${formData.currentPrice} Dt`}/>
                            <InfoBlock title="Par" content={formData.nameBid}/>
                            <div className="flex flex-wrap gap-4 mt-3">
                                <p className="text-gray-400 text-xl">
                                    <span className="text-sm ml-1">Le {formatDate(formData.updatedAt)}</span>
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 ">
                            <h2 className="text-2xl font-extrabold  text-nowrap text-[#333]">Choisir un montant :</h2>
                            <div className="flex flex-wrap gap-1 mt-4 justify-between">
                                <AmountButton selectedAmount={selectedAmount} handleAmountClick={handleAmountClick}
                                              amount={50}/>
                                <AmountButton selectedAmount={selectedAmount} handleAmountClick={handleAmountClick}
                                              amount={100}/>
                                <AmountButton selectedAmount={selectedAmount} handleAmountClick={handleAmountClick}
                                              amount={150}/>
                                <AmountButton selectedAmount={selectedAmount} handleAmountClick={handleAmountClick}
                                              amount={200}/>
                                <AmountButton selectedAmount={selectedAmount} handleAmountClick={handleAmountClick}
                                              amount={250}/>
                            </div>
                            <input
                                type="number"
                                id="default-search"
                                className="block w-full pt-2 pb-2 ps-10 mt-5 text-black border border-amber-500 text-center rounded-lg bg-amber-100 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Donner un autre montant ..."
                                value={selectedAmount || ''}
                                onChange={handleInputChange}
                                min={1}
                                required/>
                        </div>

                    </div>
                    <div className="lg:col-span-3 w-full p-5 text-start bg-amber-100  rounded-xl">
                        <span className="font-bold "> Description:</span>
                        <p className="text-sm mt-2">
                            {formData.description}
                        </p>
                    </div>
                    <div className="flex gap-2 lg:col-span-2 w-full m-1 justify-center">
                        <button type="submit" onClick={handleStartAdding}
                                disabled={formData.nameBid === session.user.username}
                                className="min-w-[200px] px-4 py-3 bg-[#333] hover:bg-[#111] text-white text-sm font-bold rounded    disabled:bg-gray-400  disabled:border-slate-200 disabled:shadow-none">
                            {formData.nameBid === session.user.username ? 'Tu es le dernier à soumettre une offre' : 'Placer une enchère'}
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Details;