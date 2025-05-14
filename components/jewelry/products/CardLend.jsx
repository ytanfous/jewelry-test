import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from "next/link";

function Card({name, phone, image, storeName, id, userId, code}) {
    const [productCount, setProductCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/getProductsByJewelerId?jewelerId=${id}`);
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

        if (id) {
            fetchData();
        }
    }, [id]);

   // const formattedPhone = phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3");

    const updateStatus = async (newStatus) => {
        setLoading(true);
        try {
            const response = await fetch("/api/jewelers/update-product-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({code, id, userId, status: newStatus}),
            });

            const result = await response.json();
            if (response.ok) {
                setStatus(newStatus);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center w-auto h-auto border border-gray-200 rounded-lg">
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
        );
    }
    const imageSrc = image || '/image/profil.png';
    return (
        <div
            className="w-full max-w-sm bg-white border flex-col flex justify-between pb-2 border-gray-200 rounded-lg shadow">
            <div className="relative h-32">
                <button  onClick={() => updateStatus("Lend")} >
                    <Image
                        src={imageSrc}
                        alt=""
                        fill
                        className="rounded-t-lg cursor-pointer"  // cursor-pointer adds a pointer cursor on hover
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 33vw"
                        priority
                    />
                </button>
            </div>
            {productCount > 0 && <div
                className="relative grid items-center text-sm whitespace-nowrap select-none bg-orange-500 text-white
            py-1 px-3 mx-auto -mt-4 w-auto rounded-full shadow">
                <span>Quantité Produit : <span className="font-bold">{productCount}</span></span>
            </div>}
            {productCount === 0 && <div
                className="relative grid items-center whitespace-nowrap text-sm  select-none bg-green-500 text-white
            py-1 px-3 mx-auto text-[14px] -mt-4 w-auto rounded-full shadow">
                <span>Aucun Produit</span>
            </div>}
            <div className="p-3 flex flex-col">
                <div>
                    <h5 className="mb-2 text-[14px] font-bold tracking-tight text-gray-900">{name}</h5>
                   {/* <p className="mb-3 font-normal text-[14px] text-gray-700">Téléphone: {formattedPhone}</p>*/}
                    <p className="mb-3 font-normal text-[14px] text-gray-700">
                        Boutique: {storeName || "-"}
                    </p>
                </div>

            </div>
            <div className="flex  gap-1 m-1">
                <button
                    onClick={() => updateStatus("Lend")}
                    disabled={loading}
                    className="self-end inline-flex items-center text-white bg-yellow-700 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-3 py-1 text-center"
                >
                    {loading && status === "Lend" ? "Updating..." : "Prêté"}
                </button>

            </div>

        </div>
    );
}

export default Card;
