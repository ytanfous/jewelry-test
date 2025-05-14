"use client"
import React, {useEffect, useRef, useState} from 'react';
import {useSession} from 'next-auth/react';
import Modal from '@/components/bids/UI/Modal';
import TypeSelector from '@/components/jewelry/products/TypeSelector';
import Calculator from '@/components/jewelry/products/Calculator';
import {useFeatures} from '@/app/hooks/featuresApi';
import LoadingPage from "@/components/UI/LoadingPage";
import ReactToPrint from "react-to-print";
import {ImPrinter} from "react-icons/im";
import ProductPrintable from "@/components/UI/ProductPrintable";
import ManageElements from "@/components/admin/setting/ManageElements";
import AddType from "@/components/jewelry/products/AddType";

function AddProduct() {
    const {data: session} = useSession();
    const {types, provenance, carat, loading} = useFeatures();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const [formData, setFormData] = useState({
        CompanyName: '', name: '', location: ''
    });
    const buttonRef = useRef(null);
    const [selectedType, setSelectedType] = useState({
        types: null, provenance: null, carat: null, weight: null,
    });
    const [calculatorValue, setCalculatorValue] = useState('0');
    const [errorMessages, setErrorMessages] = useState({
        types: '', provenance: '', carat: '', weight: '',
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dataProduct, setDataProduct] = useState({});
    const componentRef = useRef();

    function handleTypeSelect(field, value) {
        setSelectedType({
            ...selectedType, [field]: value,
        });
    }


    function handleSubmit(e) {
        e.preventDefault();
        let errors = {};

/*        if (!selectedType.types) {
            errors = {...errors, types: 'Veuillez sélectionner un type'};
        }
        if (!selectedType.provenance) {
            errors = {...errors, provenance: 'Veuillez sélectionner une provenance'};
        }
        if (!selectedType.carat) {
            errors = {...errors, carat: 'Veuillez sélectionner un carat'};
        }
        if (calculatorValue === '0') {
            errors = {...errors, weight: 'Veuillez saisir un poids valide'};
        }*/

        if (Object.keys(errors).length > 0) {
            setErrorMessages(errors);
        } else {
            setErrorMessages({
                types: '', provenance: '', carat: '', weight: '',
            });
            setModalIsOpen(true);
        }
    }


    useEffect(() => {
        if (session && session.user) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`/api/register/getUser?userId=${session.user.id}`);
                    const userData = await response.json();

                    setFormData({
                        location: userData.location || '',
                        CompanyName: userData.CompanyName || '',
                        name: userData.name || ''
                    });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchData();
        }
    }, [session]);

    async function handleModalSubmit() {
        setIsSubmitting(true);


        let adjustedWeight = calculatorValue;
        if (calculatorValue.endsWith('.')) {
            adjustedWeight += '0';
        }

        const productData = {
            userId: session.user.id,
            model: selectedType.types,
            origin: selectedType.provenance,
            carat: selectedType.carat,
            weight: adjustedWeight,
        };

        try {
            const response = await fetch('/api/products/create', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify(productData),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(true);
                setModalIsOpen(true);
                setDataProduct({
                    model: data.product.model,
                    origin: data.product.origin,
                    carat: data.product.carat,
                    weight: data.product.weight,
                    code: data.product.code,
                });
            } else {
                const errorData = await response.json();
                console.error('Error creating product:', errorData);
            }
        } catch (error) {
            console.error('Error creating product:', error);
        } finally {
            setTimeout(() => {
                if (buttonRef.current) {
                    buttonRef.current.click();
                }
            }, 10);
        }
    }

    if (loading) {
        return <LoadingPage/>;
    }

    return (
        <div className="flex flex-wrap justify-around flex-col">
        <div className="flex flex-wrap flex-row gap-1">
            <div className="max-w-80 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Modèle</h1>
                <AddType userId={session?.user.id}/>

                <TypeSelector types={types} onSelect={(value) => handleTypeSelect('types', value ? value.name : null)}/>
            </div>
            <div className="flex flex-col items-center max-w-24 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Provenance</h1>
                <TypeSelector types={provenance} onSelect={(value) => handleTypeSelect('provenance', value ? value.name : null)}/>
            </div>

            <div className="flex flex-col items-center max-w-24 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Carat</h1>
                <TypeSelector types={carat} onSelect={(value) => handleTypeSelect('carat', value ? value.value : null)}/>
            </div>

            <div className="flex flex-col max-w-96 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Poids</h1>
                <Calculator value={calculatorValue} onChange={setCalculatorValue}/>
            </div>
        </div>
        <div className="flex m-2 flex-wrap gap-2 justify-end">
            {Object.keys(errorMessages).some((key) => errorMessages[key]) && (<div
                className="bg-red-400 rounded-xl text-gray-700 flex flex-row items-center gap-2 pr-1 pl-1 justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none"
                     viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-center">{Object.values(errorMessages).filter((msg) => msg).join(', ')}</p>
            </div>)}

            <button
                type="submit"
                className={`hover:shadow-form rounded-md max-w-36 py-3 px-8 text-base font-semibold text-white mb-1 mt-1 outline-none ${isSubmitting ? 'bg-gray-500' : 'bg-blue-700 hover:bg-blue-800'}`}
                onClick={handleModalSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Chargement...' : 'Valider'}
            </button>
        </div>

        <ReactToPrint
            trigger={() => (

                <button
                    type="button"
                    ref={buttonRef}
                    className="hidden hover:shadow-form rounded-md py-3 px-8 gap-4 flex justify-center items-center text-base font-semibold text-white mb-1 mt-1 outline-none bg-blue-500 hover:bg-blue-700"
                >
                    <p> impression du
                        ticket</p> <ImPrinter/>
                </button>
            )}
            content={() => componentRef.current}
            onAfterPrint={() => {
                window.location.reload();
            }}
        />
        <ProductPrintable dataProduct={dataProduct} componentRef={componentRef}
                          formData={formData}/>

    </div>);
}

export default AddProduct;