"use client"
import React, {useState} from 'react';
import Input from "@/components/bids/bid/UI/Input";
import ImagePicker from "@/components/bids/bid/UI/imagePicker";
import Modal from "@/components/bids/UI/Modal";


function AddBid() {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        carat: '',
        weight: '',
        type: '',
        description: '',
        startPrice: '',
        currentPrice: '',
        nameBid: '',
        pictures: []
    });

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    function handleInputChange(e) {
        const {name, value} = e.target;
        if (name === 'startPrice') {

            setFormData({
                ...formData, startPrice: value, currentPrice: value
            });
        } else if (name === 'title') {
            setFormData({
                ...formData, title: value, nameBid: value
            });
        } else {
            setFormData({
                ...formData, [name]: value
            });
        }
    }

    function validateForm() {
        const errors = {};
        if (!formData.title || formData.title.length < 5) {
            errors.title = 'Veuillez fournir un titre valide (au moins 5 caractères)';
        }
        if (!formData.startPrice || formData.startPrice < 0) {
            errors.startPrice = 'Veuillez indiquer un prix de lancement valide';
        }
        if (!formData.weight || formData.weight < 0) {
            errors.weight = 'Veuillez indiquer un poids valide';
        }
        if (!formData.carat || formData.carat < 0) {
            errors.carat = 'Veuillez indiquer un carat valide';
        }
        if (!formData.type || formData.type.length < 5) {
            errors.type = 'Veuillez fournir un type valide (au moins 5 caractères)';
        }
        if (!formData.description || formData.description.length < 7) {
            errors.description = 'Veuillez fournir une description valide ';
        }
        if (!formData.pictures || formData.pictures.length !== 4) {
            errors.pictures = 'Veuillez fournir quatre images valides';
        }

        return errors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormSubmitted(true);
        const errors = validateForm();
        setFormErrors(errors);
        if (Object.keys(errors).length === 0) {
            try {
                const response = await fetch('/api/auction/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    setFormData({
                        title: '',
                        carat: '',
                        weight: '',
                        type: '',
                        description: '',
                        startPrice: '',
                        currentPrice: '',
                        nameBid: '',
                        pictures: []
                    });
                    handleStopAdding();
                    const data = await response.json();
                    alert("success")
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                } else {
                    alert('Failed to create auction');
                }
            } catch (error) {
                console.error('Error creating auction:', error);
                alert('Failed to create auction');
            }
        } else {
            handleStopAdding()
        }
    }

    function handleStopAdding() {
        setModalIsOpen(false);
    }

    function handleStartAdding() {
        setModalIsOpen(true);
    }


    function handleImageChange(newImage) {
        setFormData(prevState => ({
            ...prevState,
            pictures: [...prevState.pictures, newImage]
        }));
    }


    function handleDeleteImage(index) {
        setFormData(prevState => {
            const updatedPictures = [...prevState.pictures];
            updatedPictures.splice(index, 1);
            return {
                ...prevState,
                pictures: updatedPictures
            };
        });
    }


    return (<>
        <div className="flex p-6 flex-wrap lg:max-w-7xl max-w-4xl mx-auto justify-center ">

            <form className="p-6  border-2 border-amber-500 rounded" noValidate onSubmit={handleSubmit}>
                <div
                    className="flex flex-wrap flex-col justify-start text-[16px] font-bold mb-2">
                    {formSubmitted && Object.keys(formErrors).length > 0 && (<>
                            {Object.values(formErrors).map((error, index) => (<div key={index}
                                                                                   className="m-1  bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     className="stroke-current shrink-0 h-6 w-6"
                                     fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p key={index}>{error}</p>
                            </div>))}
                        </>

                    )}

                </div>
                <div className="flex flex-wrap -mx-3 mb-3">
                    <Input label="Titre" classes="w-full md:w-1/2 px-3 mb-3 md:mb-0" name="title" id="title"
                           placeholder="Title...." value={formData.title} onChange={handleInputChange} required/>
                    <Input label="Type de bijoux" classes="w-full md:w-1/2 px-3 mb-3 md:mb-0" name="type" id="type"
                           value={formData.type} onChange={handleInputChange}
                           placeholder="Type de bijoux..." required/>
                </div>
                <div className="flex flex-wrap -mx-3 mb-3">
                    <Input label="Poids" classes="w-full md:w-1/3 px-3 mb-3 md:mb-0" name="weight" id="weight"
                           value={formData.weight} onChange={handleInputChange}
                           placeholder="weight...." type="number" required/>
                    <Input label="Carat" classes="w-full md:w-1/3 px-3 mb-3 md:mb-0" name="carat" id="carat"
                           value={formData.carat} onChange={handleInputChange}
                           placeholder="Carat...." type="number" required/>
                    <Input label="Prix de lancement " classes="w-full md:w-1/3 px-3 mb-3 md:mb-0" name="startPrice"
                           value={formData.startPrice} onChange={handleInputChange}
                           id="startPrice"
                           placeholder="Prix de lancement...." type="number" required/>
                </div>
                <div className="flex flex-wrap -mx-3 mb-3">
                    <div className="w-full px-3">
                        <label className="block tracking-wide text-gray-700 text-[16px] font-bold mb-2"
                               htmlFor="description">
                            Description
                        </label>
                        <textarea
                            className=" resize-none appearance-none block w-full  text-black border border-amber-500 h-40 rounded-lg  focus:ring-black focus:border-2 focus:border-black  py-3 px-4 mb-3 leading-tight focus:outline-none bg-amber-50"
                            id="description" name="description" rows="4" value={formData.description}
                            onChange={handleInputChange} required/>
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">

                    <div className="w-full px-3">
                        <label className="block tracking-wide text-gray-700 text-[16px] font-bold mb-2"
                               htmlFor="image">
                            Ajouter des images
                        </label>
                        <ImagePicker name="pictures" onChange={handleImageChange} onDeleteImage={handleDeleteImage}
                                     pictures={formData.pictures}/>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center">
                    <button type="button"
                            className="min-w-[200px] px-4 py-3 bg-amber-600 hover:bg-amber-900 text-white
                                text-sm font-bold rounded group-invalid:pointer-events-none group-invalid:opacity-30"
                            onClick={handleStartAdding}>Valider
                    </button>

                </div>

            </form>

        </div>
        <Modal open={modalIsOpen} onClose={handleStopAdding}>

            <div className="relative bg-white rounded-lg shadow ">
                <button type="button" onClick={handleStopAdding}
                        className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900
                             rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
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
                    <h3 className="mb-5 text-lg font-normal text-gray-500 ">Voulez-vous vraiment ajouter cette
                        enchère ?</h3>
                    <button data-modal-hide="popup-modal" type="submit" onClick={handleSubmit}
                            className="text-white focus:ring-4 bg-amber-600 hover:bg-amber-900 focus:outline-none
                                 focus:ring-red-300  font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                        Oui, je suis sûr
                    </button>
                    <button data-modal-hide="popup-modal" type="button" onClick={handleStopAdding}
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg
                                hover:bg-amber-200 bg-amber-100 focus:z-10 focus:ring-4 focus:ring-gray-100 ">No,
                        Annuler
                    </button>
                </div>
            </div>
        </Modal>
    </>);
}

export default AddBid;