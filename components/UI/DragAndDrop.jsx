import React, {useState} from 'react';

function DragAndDrop({setSelectedType, errorMessages}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleRemoveFile = () => {
        setSelectedType((prevData) => ({
            ...prevData,
            image: null,
        }));
        setSelectedFile(null);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataURL = reader.result;
                const newImage = {
                    size: file.size,
                    type: file.type,
                    name: file.name,
                    lastModified: file.lastModified,
                    dataURL: dataURL
                };
                console.log(newImage);
                setSelectedType((prevData) => ({
                    ...prevData,
                    image: newImage,
                }));
            };
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataURL = reader.result;
                setSelectedType((prevData) => ({
                    ...prevData,
                    image: {
                        type: file.type, // MIME type
                        dataURL: dataURL, // Base64 encoded string
                    },
                }));
            };
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };

    return (
        <div className="mb-6 ">
            <h1 className="font-light leading-none text-center tracking-tight text-gray-900 text-3xl border-b-2 pb-2 mb-2">Ajouter une
                image</h1>
            <div
                className={`relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center ${dragActive ? 'border-blue-500' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input type="file" name="file" id="file" accept="image/png, image/jpeg"
                       className="sr-only" onChange={handleFileChange}/>
                <label htmlFor="file"
                       className="absolute inset-0 flex items-center justify-center cursor-pointer">
                    <div>
                        <span className="mb-2 block text-xl font-semibold text-[#07074D]">Déposez l'image ici</span>
                        <span className="mb-2 block text-base font-medium text-[#6B7280]">Ou</span>
                        <span
                            className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D]">Parcourir</span>
                    </div>
                </label>
            </div>
            {errorMessages?.image && (
                <div className="mt-4 bg-red-400 rounded-xl text-gray-700 p-2 flex flex-nowrap gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6"
                         fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p>{errorMessages?.image}</p>
                </div>
            )}
            {selectedFile && (
                <div className="flex items-center gap-2 justify-end mt-4">
                    <div className="text-left">
                        <p className="text-gray-700">{selectedFile.name}</p>
                    </div>
                    <div className="flex items-center">
                        <button type="button" onClick={handleRemoveFile}
                                className="text-red-500 hover:text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DragAndDrop;