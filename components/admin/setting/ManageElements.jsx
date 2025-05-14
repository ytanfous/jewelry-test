import React, { useState, useEffect } from 'react';
import { CiCircleRemove } from "react-icons/ci";
import Modal from "@/components/bids/UI/Modal";

export default function ManageElements({ type }) {
    const [name, setName] = useState('');
    const [list, setList] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [elementToRemove, setElementToRemove] = useState(null); // Element to be removed

    // Fetch existing elements when the component mounts
    useEffect(() => {
        fetchElements();
    }, []);  // Empty dependency array ensures it runs only once on mount

    // Fetch existing elements
    async function fetchElements() {
        try {
            const res = await fetch(`/api/admin/${type}`);
            if (res.ok) {
                const data = await res.json();
                setList(data);
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error fetching elements:', error);
        }
    }

    // Add a new element
    const addElement = async () => {
        try {
            const res = await fetch(`/api/admin/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const newElement = await res.json();
            setList([...list, newElement]);
            setName('');  // Clear the input after adding
        } catch (error) {
            console.error('Error adding element:', error);
        }
    };

    // Remove an element
    const handleModalSubmit = async () => {
        try {
            await fetch(`/api/admin/${type}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: elementToRemove }),
            });
            setList(list.filter((item) => item.id !== elementToRemove));
            setElementToRemove(null); // Clear the selected element
            setModalIsOpen(false); // Close the modal
        } catch (error) {
            console.error('Error removing element:', error);
        }
    };

    // Open the modal to confirm removal
    const confirmRemoveElement = (id) => {
        setElementToRemove(id); // Set the element to remove
        setModalIsOpen(true);   // Open the modal
    };

    return (
        <>
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/3">
                <div className="relative flex flex-col min-w-0 break-words shadow-md bg-white rounded-2xl bg-clip-border transition-transform duration-300 ease-in-out min-h-[200px] p-4">
                    {type === "provenance" && <h3 className="font-semibold mb-4 text-2xl">Provenance</h3>}
                    {type === "type" && <h3 className="font-semibold mb-4 text-2xl">Modèle</h3>}
                    {type === "carat" && <h3 className="font-semibold mb-4 text-2xl">Carat</h3>}
                    <div className="flex flex-wrap gap-2">
                        {list.map((item) => (
                            <button
                                key={item.id}
                                className="rounded-xl border-2 cursor-auto border-blue-800 px-2 py-1 text-base font-medium text-blue-800 transition duration-200 hover:bg-blue-600/5 active:bg-blue-700/5 flex items-center justify-between"
                            >
                                {item?.name || item?.value}
                                <CiCircleRemove
                                    className="rounded-xl cursor-pointer text-2xl ml-2 text-blue-800 hover:bg-red-700 hover:text-white"
                                    onClick={() => confirmRemoveElement(item.id)}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4 align-middle">
                        <div className="md:w-2/3">
                            <input
                                className="px-5 py-3 appearance-none border-2 border-blue-200  rounded-xl w-full text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={addElement}
                            className="rounded-xl bg-gradient-to-br from-blue-600 to-pink-300 px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-blueSecondary/50 "
                        >
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <div className="relative bg-white rounded-lg shadow">
                    <button
                        type="button"
                        onClick={() => setModalIsOpen(false)}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>
                        <h3 className="mb-5 text-lg font-normal text-gray-500">Vous souhaitez vraiment supprimer cet élément ?</h3>

                        <button
                            type="button"
                            onClick={handleModalSubmit}
                            className="text-white focus:ring-4 bg-gradient-to-br from-blue-600 to-pink-300 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                            Oui, je suis sûr
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalIsOpen(false)}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-blue-100 hover:bg-blue-200 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                        >
                            Non, annuler
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
