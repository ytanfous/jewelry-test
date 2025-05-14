import React, {useEffect, useState} from 'react';
import Loading from "@/app/jewelry/lend/[slugLend]/loading";
import Card from "@/components/jewelry/cards/Cards";
import CardLend from "@/components/jewelry/products/CardLend";
import Link from "next/link";
import Image from "next/image";
import Modal from "@/components/bids/UI/Modal";

function JewelerLend({userId,code, jewelerId}) {
    const [Jewelers, setJewelers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productCount, setProductCount] = useState(null);
    const [status, setStatus] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [stateToSet, setStateToSet] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/jewelers/${jewelerId}`);
                if (response.ok) {
                    const data = await response.json();
                    setJewelers(data);
                } else {
                    console.error('Failed to fetch Jewelers');
                }
            } catch (error) {
                console.error('Error fetching Jewelers:', error);
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            fetchData();
        }
    }, [userId,jewelerId]);


    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/getProductsByJewelerId?jewelerId=${jewelerId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProductCount(data.length);
                } else {
                    console.error('Failed to fetch jeweler data');
                }
            } catch (error) {
                console.error('Error fetching jeweler data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (jewelerId) {
            fetchData();
        }
    }, [jewelerId]);
    const formattedPhone = Jewelers?.phone ? Jewelers?.phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3") : "-";
    const imageSrc = Jewelers?.image  || '/image/profil.png';
    if (loading) {
        return <Loading />;
    }

    const openConfirmationModal = (state) => {
        setStateToSet(state);
        setModalIsOpen(true);
    };

    const handleModalSubmit = async () => {
        if (!stateToSet) return;

        setLoading(true);
        try {
            const passwordCheckResponse = await fetch('/api/auth/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    password: password,
                }),
            });

            const passwordCheckResult = await passwordCheckResponse.json();

            if (!passwordCheckResponse.ok || !passwordCheckResult.success) {
                throw new Error('Mot de passe incorrect');
            }

            const response = await fetch("/api/jewelers/update-product-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({code, id : jewelerId, userId, status: stateToSet}),
            });

            const result = await response.json();
            if (response.ok) {
                setStatus(stateToSet);
                window.location.href = '/';
            } else {
                alert(result.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred while updating the product status.");
        } finally {
            setLoading(false);
        }
    };

    return (<>
        <div
            className=" w-80 bg-white border mt-4 flex-col flex justify-between pb-2 border-gray-200 rounded-lg shadow">
            <div className="relative h-64">
                <Link href={`/jewelry/jeweler/${jewelerId}`} passHref>
                    <Image
                        src={imageSrc}
                        alt=""
                        fill
                        className="rounded-t-lg cursor-pointer"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 33vw"
                        priority
                    />
                </Link>
            </div>
            {productCount > 0 && <div
                className="relative grid items-center whitespace-nowrap select-none bg-orange-500 text-white
            py-1 px-3 mx-auto -mt-4 w-auto rounded-full shadow">
                <span>Quantité Produit : <span className="font-bold">{productCount}</span></span>
            </div>}
            {productCount === 0 && <div
                className="relative grid items-center whitespace-nowrap select-none bg-green-500 text-white
            py-1 px-3 mx-auto text-[14px] -mt-4 w-auto rounded-full shadow">
                <span>Aucun Produit</span>
            </div>}
            <div className="p-3 flex flex-col">
                <div>
                    <h5 className="mb-2 text-[14px] font-bold tracking-tight text-gray-900">{Jewelers?.name}</h5>
               {/*     <p className="mb-3 font-normal text-[14px] text-gray-700">Téléphone: {formattedPhone}</p>*/}
                    <p className="mb-3 font-normal text-[14px] text-gray-700">
                        Boutique: {Jewelers?.storeName || "-"}
                    </p>
                </div>

            </div>
            <div className="flex  gap-1 m-1 flex-wrap w-full">
                <button
                    onClick={() => openConfirmationModal("Sold")}
                    disabled={loading}
                    className="self-end inline-flex items-center text-white bg-yellow-700 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-3 py-1 text-center"
                >
                    {loading && stateToSet === "Sold" ? "Updating..." : "Vendu"}
                </button>
                <button
                    onClick={() => openConfirmationModal("Active")}
                    disabled={loading}
                    className="self-end inline-flex items-center text-white bg-blue-700 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-3 py-1 text-center"
                >
                    {loading && stateToSet === "Active" ? "Updating..." : "Rendu"}
                </button>

            </div>

        </div>
            {modalIsOpen && (
                <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                    <div className="relative bg-white rounded-lg shadow">
                        <button type="button" onClick={() => setModalIsOpen(false)}
                                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                data-modal-hide="popup-modal">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                        <div className="p-4 md:p-5 text-center">
                            <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>

                            {stateToSet === 'Active' &&
                                <h3 className="mb-5 text-lg font-normal text-gray-500">Voulez-vous vraiment reprendre ce
                                    bijou ?</h3>}
                            {stateToSet === 'Sold' &&
                                <h3 className="mb-5 text-lg font-normal text-gray-500">Voulez-vous vraiment vendre ce
                                    bijou ?</h3>}
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mb-4 p-2 border-2 rounded w-full  outline-none focus-within:border-blue-700  focus:ring-blue-500 "
                            />
                            {confirmError && (

                                <div
                                    className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 mb-2 p-1 justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                                         fill="none"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p className="text-center">{confirmError}
                                    </p>
                                </div>
                            )}
                            <button data-modal-hide="popup-modal" type="button" onClick={handleModalSubmit}
                                    className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                Oui, je suis sûr
                            </button>
                            <button data-modal-hide="popup-modal" type="button" onClick={() => setModalIsOpen(false)}
                                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg hover:bg-blue-200 bg-blue-100 focus:z-10 focus:ring-4 focus:ring-gray-100">Non,
                                Annuler
                            </button>
                        </div>

                    </div>
                </Modal>
            )}
        </>
    );
}

export default JewelerLend;