"use client";
import React, {useEffect, useRef, useState} from 'react';
import {useSession} from 'next-auth/react';
import {useFeatures} from '@/app/hooks/featuresApi';
import LoadingPage from '@/components/UI/LoadingPage';
import TypeSelector from '@/components/jewelry/products/TypeSelector';
import Calculator from '@/components/jewelry/products/Calculator';
import Modal from '@/components/bids/UI/Modal';
import {ImBin} from "react-icons/im";

function AddSupplierOrder() {
    const {data: session} = useSession();
    const {types, provenance, carat, loading} = useFeatures();
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [code, setCode] = useState('');
    const dropdownRef = useRef(null);
    const [supplier, setSupplier] = useState({
        name: null, contact: null, formattedSupplierId: null, note: null, advance: null, price: null,
    });
    const [selectedOrder, setSelectedOrder] = useState({
        model: null, origin: null, carat: null, weight: null, quantity: 0,
    });
    const [orders, setOrders] = useState([]);
    const [calculatorValue, setCalculatorValue] = useState('0');
    const [errorMessages, setErrorMessages] = useState({
        model: '', provenance: '', carat: '', weight: '', name: ''
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldsDisabled, setFieldsDisabled] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    function handleTypeSelect(field, value) {
        setSelectedOrder({
            ...selectedOrder, [field]: value,
        });
    }

    function handleSupplierSelect(field, value) {
        setSupplier({
            ...supplier, [field]: value,
        });
    }

    function handleAddOrder() {
        let errors = {};
        const formattedSupplierId = code?.formattedSupplierId || '';
        if (formattedSupplierId.length === 0) {
            if (!supplier.name) {
                errors = {...errors, name: 'Veuillez saisir un nom'};
            }

        }

        if (!selectedOrder.quantity || selectedOrder.quantity <= 0) {
            errors = {...errors, provenance: 'Veuillez saisir une valeur supérieure à 0'};
        }


        if (Object.keys(errors).length > 0) {

            setErrorMessages(errors);
        } else {
            setErrorMessages({
                types: '', provenance: '', carat: '', weight: '', model: ''
            });
            setOrders([...orders, {...selectedOrder, weight: calculatorValue}]);

            setCalculatorValue('0');
        }
    }

    function handleQuantityChange(event) {
        const value = event.target.value;
        setSelectedOrder((prevState) => ({
            ...prevState, quantity: value,
        }));
    }

    function handleStopAdding() {
        setModalIsOpen(false);
    }

    async function handleSubmit() {
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/suppliers/create', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({
                    userId: session.user.id, orders, supplier,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
                const errorData = await response.json();
                console.error('Error creating orders:', errorData);
            }
        } catch (error) {
            console.error('Error creating orders:', error);
        }
    }


    function handleDeleteOrder(index) {
        const updatedOrders = orders.filter((order, orderIndex) => orderIndex !== index);
        setOrders(updatedOrders);
    }

    useEffect(() => {
        async function fetchSuppliers() {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/suppliers/list?userId=${session.user.id}`);
                    const data = await response.json();
                    setSuppliers(data);
                    setFilteredSuppliers(data);
                } catch (error) {
                    console.error('Error fetching suppliers:', error);
                }
            }
        }

        fetchSuppliers();
    }, [session]);

    useEffect(() => {
        const filtered = suppliers.filter(supplier => supplier.formattedSupplierId.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredSuppliers(filtered);
    }, [searchTerm, suppliers]);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value === '') {
            setFilteredSuppliers([]);
            setShowDropdown(false);
            setSupplier({
                formattedSupplierId: null, name: '', contact: ''
            });
        } else {
            const filtered = suppliers.filter(supplier => supplier.formattedSupplierId.toLowerCase().includes(value.toLowerCase()));

            setFilteredSuppliers(filtered);
            setShowDropdown(true);

            if (filtered.length === 0) {
                setSupplier({
                    formattedSupplierId: null, name: '', contact: ''
                });
            } else if (searchTerm) {
                setSupplier({
                    name: '', contact: ''
                });
            }
        }
    };

    const handleOptionClick = (supplier) => {
        setCode(supplier);
        setSupplier({
            name: supplier.name, contact: supplier.contact, formattedSupplierId: supplier.formattedSupplierId,
        });
        setSearchTerm(supplier.formattedSupplierId);
        setShowDropdown(false);
        setFieldsDisabled(true); // Disable fields after selecting a supplier
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (loading) {
        return <LoadingPage/>;
    }
    const handleClear = () => {
        setSearchTerm('');
        setSupplier((prevState) => ({
            name: null, contact: null, formattedSupplierId: null
        }));
        setFieldsDisabled(false);
    };
    return (<div className="flex flex-wrap justify-around flex-col">
        <div className="flex flex-col m-2">
            <div className="flex flex-row gap-5 ">
                <div className="max-w-96  m-2">
                    <h1 className="font-light leading-none text-center min-w-60 tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                        Code Fournisseur
                    </h1>
                    <div className="relative w-full" ref={dropdownRef}>
                        <input
                            type="text"
                            placeholder="Code fournisseur déjà existant..."
                            value={searchTerm}
                            onChange={handleInputChange}
                            className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10"
                            onFocus={() => setShowDropdown(true)}
                        />
                        {searchTerm && (<div
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300 cursor-pointer"
                            onClick={handleClear}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>)}
                        {showDropdown && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 max-h-60 overflow-y-auto">
                                {filteredSuppliers.length > 0 ? (filteredSuppliers.map((supplier) => (<li
                                    key={supplier.id}
                                    className="p-2 cursor-pointer hover:bg-gray-200 text-sm rounded-lg"
                                    onClick={() => handleOptionClick(supplier)}
                                >
                                    {supplier.formattedSupplierId} - {supplier.name}
                                </li>))) : (<li className="p-2">Aucun fournisseur trouvé</li>)}
                            </ul>)}
                    </div>

                </div>
                <div className="max-w-96  m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                        Nom de Fournisseur
                    </h1>
                    <input
                        type="text"
                        value={supplier.name || ''}
                        onChange={(e) => handleSupplierSelect('name', e.target.value)}
                        className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        disabled={fieldsDisabled}
                        placeholder="Écrivez le Nom de Fournisseur..."/>
                </div>
                <div className="max-w-96  m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                        Contact de Fournisseur
                    </h1>
                    <input
                        type="text"
                        value={supplier.contact || ''}
                        onChange={(e) => handleSupplierSelect('contact', e.target.value)}
                        className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        disabled={fieldsDisabled}
                        placeholder="Écrivez le Contact de Fournisseur..."/>
                </div>
                <div className="max-w-96  m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Prix</h1>
                    <div>
                        <input type="number" id="price"
                               className="bg-gray-50 border-2 outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  "
                               onChange={(e) => handleSupplierSelect('price', e.target.value)}
                               placeholder="Écrivez le montant..."/>
                    </div>
                </div>
                <div className="max-w-96  m-2">
                    <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Avance</h1>
                    <div>
                        <input type="number" id="advance"
                               className="bg-gray-50 border-2 outline-none border-gray-300  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  "
                               onChange={(e) => handleSupplierSelect('advance', e.target.value)}
                               placeholder="Écrivez le montant..."/>
                    </div>
                </div>

            </div>
            <div className="mt-2">
            <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Note</h1>
                <textarea
                    id="message"
                    rows="4"
                    className="block p-2.5 w-full  mb-5  outline-none bg-gray-50 rounded-lg border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500  focus:border-2 resize-none"
                    placeholder="Écrivez votre note ici..."
                    value={supplier.note || ''}
                    onChange={(e) => handleSupplierSelect('note', e.target.value)}
                ></textarea>
            </div>
        </div>
        <div className="flex flex-wrap flex-row gap-1">
            <div className="max-w-80 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                    Quantité
                </h1>
                <input
                    type="number"
                    value={selectedOrder.quantity}
                    onChange={handleQuantityChange}
                    className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
            </div>
            <div className="max-w-80 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                    Modèle
                </h1>
                <TypeSelector types={types} onSelect={(value) => handleTypeSelect('model', value ? value.name : null)}/>
            </div>

            <div className="flex flex-col items-center max-w-24 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                    Provenance
                </h1>
                <TypeSelector types={provenance} onSelect={(value) => handleTypeSelect('origin', value ? value.name : null)}/>
            </div>

            <div className="flex flex-col items-center max-w-24 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                    Carat
                </h1>
                <TypeSelector types={carat} onSelect={(value) => handleTypeSelect('carat', value ? value.value : null)}/>
            </div>

            <div className="flex flex-col max-w-96 mx-auto m-2">
                <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">
                        Poids
                    </h1>
                    <Calculator value={calculatorValue} onChange={setCalculatorValue}/>
                </div>
            </div>
            <div className="flex m-2 flex-wrap gap-2 justify-end">
                {Object.keys(errorMessages).some((key) => errorMessages[key]) && (<div
                    className="bg-red-400 rounded-xl text-gray-700 flex flex-row pr-2 pl-2 items-center gap-2 justify-center">

                    <p className="text-center ">{Object.values(errorMessages).filter((msg) => msg).join(', ')}</p>
                </div>)}

                <button
                    type="button"
                    className={`hover:shadow-form rounded-md max-w-36 py-3 px-2 text-base  font-semibold text-white mb-1 mt-1 outline-none ${isSubmitting ? 'bg-gray-500' : 'bg-blue-700 hover:bg-blue-800'}`}
                    onClick={handleAddOrder}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Chargement...' : 'Ajouter une Cdommande'}
                </button>
            </div>
            <div className="flex flex-col m-2">
                <h2 className="font-light leading-none text-start tracking-tight text-gray-900 text-2xl border-b-2 pb-2 mb-2">
                    Liste des commandes
                </h2>
                {orders.length !== 0 && <div className="max-w-60">
                    <table className="min-w-full divide-y divide-gray-200 ">
                        <thead>
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Modèle</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Provenance</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Carat</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Poids</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Quantité</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 ">
                        {orders.map((order, index) => (<tr key={index + 1} className="hover:bg-gray-100">
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {order.model}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {order.origin}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {order.carat}
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {order.weight}g
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {order.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    <button type="button"
                                            className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg
                        text-sm px-5 py-2.5 text-center me-2 mb-2 " onClick={() => handleDeleteOrder(index)}
                                    ><ImBin/>
                                    </button>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>

                </div>}

            </div>
            <div className="flex m-2 flex-wrap gap-2 justify-end">
                <button
                    type="button"
                    className={`hover:shadow-form rounded-md max-w-36 text-nowrap py-3 disabled:bg-gray-400 px-8 text-base font-semibold text-white mb-1 mt-1 outline-none ${isSubmitting ? 'bg-gray-500' : 'bg-blue-700 hover:bg-blue-800'}`}
                    onClick={() => setModalIsOpen(true)}
                    disabled={isSubmitting || orders.length === 0}

                >
                    {isSubmitting ? 'Chargement...' : 'Valider'}
                </button>
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
                        <h3 className="mb-5 text-xl font-normal text-gray-500 ">Voulez-vous vraiment valider tous les
                            Commandes?</h3>
                        <button
                            type="button"
                            className="text-white focus:ring-4 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Chargement...' : 'Oui, je suis sûr'}
                        </button>
                        <button
                            type="button"
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-500 focus:outline-none bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg border border-gray-200"
                            onClick={handleStopAdding}
                        >
                            No, Annuler
                        </button>
                    </div>
                </div>
            </Modal>
        </div>);
}

export default AddSupplierOrder;
