import {useRef} from "react";

function ImagePicker({name, onChange, onDeleteImage, pictures}) {
    const imageInput = useRef(null);

    function handleImageChange(event) {
        const fileList = event.target.files;
        const newImages = [];
        if (fileList.length < 5) {
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
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
                    newImages.push(newImage);

                    if (newImages.length === fileList.length) {
                        newImages.forEach(image => onChange(image));
                    }
                };

                reader.readAsDataURL(file);
            }
        }
    }

    function handleDeleteImage(index) {
        onDeleteImage(index);
    }

    return (
        <>
            <div className="flex items-center justify-center w-full" onDrop={(e) => {
                e.preventDefault();
                handleDrop(e);
            }}
                 onDragOver={(e) => e.preventDefault()}>
                <label htmlFor={name}
                       className="flex flex-col items-center justify-center w-full h-32 border-2 p-2 border-amber-500 border-dashed rounded-lg cursor-pointer bg-amber-50  ">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 ">
                        <svg className="w-8 h-8 mb-4 text-gray-500 pt-1" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Cliquez pour télécharger ou glisser-déposer</span>
                        </p>
                        <p className="text-xs text-gray-500 ">PNG ou JPG </p>
                    </div>
                    <input
                        id={name}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg"
                        name={name}
                        ref={imageInput}
                        onChange={handleImageChange}
                        multiple
                    />
                </label>
            </div>
            <ul id="gallery" className="flex flex-1 flex-wrap mt-5 justify-around gap-2">
                {pictures.length === 0 &&
                    <span className="text-small text-gray-500 text-center">Aucune image sélectionnée</span>}
                {pictures.length > 0 && pictures.map((image, index) => (<li key={index}>
                    <div
                        className="relative flex rounded-xl overflow-hidden align-center border-4  overflow w-48 h-48 border-yellow-500">
                        <img src={image.dataURL} alt={image.name} className="w-full cursor-pointer rounded-lg"/>
                        <button
                            className="absolute top-0 right-0  m-1   rounded-full text-red-500 hover:bg-white hover:text-red-700"
                            onClick={() => handleDeleteImage(index)} type="button">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 "
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </li>))}
            </ul>
        </>
    );
}

export default ImagePicker;
