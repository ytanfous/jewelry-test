import React, {useState} from 'react';
import Calculator from "@/components/jewelry/products/Calculator";
import TypeSelector from "@/components/jewelry/products/TypeSelector";
import LoadingPage from "@/components/UI/LoadingPage";
import Modal from "@/components/bids/UI/Modal";
import ReactToPrint from "react-to-print";
import {ImPrinter} from "react-icons/im";
import ProductPrintable from "@/components/UI/ProductPrintable";

function AddSalf({userId, jewelerId}) {
    const [calculatorValue, setCalculatorValue] = useState('0');
    const [unit, setUnit] = useState(null);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleNoteChange = (event) => {
        setNote(event.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalIsOpen(true);
    }
const types = [{id:1,name: "T"},{id:2,name: "E"},{id:3,name: "D"}]

    async function handleModalSubmit() {
        setIsSubmitting(true);


        let adjustedWeight = calculatorValue;
        if (calculatorValue.endsWith('.')) {
            adjustedWeight += '0';
        }

        try {
            const response = await fetch('/api/Slaf/create', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({userId, jewelerId, amount: adjustedWeight, note, unit}),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(true);
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error('Error creating product:', errorData);
            }
        } catch (error) {
            console.error('Error creating product:', error);
        } finally {
            setIsSubmitting(false);
        }
    }


    return (<>
        <div className="flex flex-col">
            <div className="flex flex-wrap">
                <div className="flex flex-col max-w-96 gap-2 mx-auto m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Montant</h1>
                    <Calculator value={calculatorValue} onChange={setCalculatorValue}/>
                    <TypeSelector types={types} onSelect={(value) => setUnit(value ? value.name : null)}/>
                </div>
                <div className="flex flex-col w-2/3  mx-auto m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Note</h1>
                    <textarea
                        id="message"
                        rows="13"
                        className="block p-2.5 w-full  mb-5 text-xl outline-none bg-gray-50 rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500  focus:border-2 resize-none"
                        placeholder="Écrivez votre note ici..."
                        value={note}
                        onChange={handleNoteChange}
                    ></textarea>
                </div>
            </div>
            <div className="flex justify-end mr-6">
                <button
                    type="submit"
                    className={`hover:shadow-form rounded-md max-w-36 py-3 px-8 text-base font-semibold text-white mb-1 mt-1 outline-none ${isSubmitting ? 'bg-gray-500' : 'bg-blue-700 hover:bg-blue-800'}`}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Chargement...' : 'Valider'}
                </button>
            </div>

        </div>
            <Modal open={modalIsOpen} onClose={() => {


                setModalIsOpen(false)
            }}>
                <div className="relative bg-white rounded-lg shadow ">
                    <button
                        type="button"
                        onClick={() => {
                            if (success) {
                                window.location.reload();
                            }

                            setModalIsOpen(false)
                        }}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                        data-modal-hide="popup-modal"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">

                            <>
                                <h1 className="mb-5 text-[24px] font-bold text-gray-500">Es-tu sûr ?</h1>
                                <h3 className="mb-5 text-lg font-normal text-gray-500">Voulez-vous vraiment ajouter ce
                                    Slaf
                                    ?</h3>
                                <button
                                    data-modal-hide="popup-modal"
                                    type="button"
                                    onClick={handleModalSubmit}
                                    className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                                >
                                    Oui, je suis sûr
                                </button>
                                <button
                                    data-modal-hide="popup-modal"
                                    type="button"
                                    onClick={() => setModalIsOpen(false)}
                                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-blue-100 hover:bg-blue-200 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                                >
                                    Non, annuler
                                </button>
                            </>

                    </div>
                </div>
            </Modal>
        </>
    );
}

export default AddSalf;