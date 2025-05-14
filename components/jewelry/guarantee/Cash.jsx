function Cash({
                  price, handlePriceChange, formErrors
              }) {

    return (
        <div className="mx-auto w-full max-w-[550px] bg-white mt-2 border border-white shadow p-4 rounded-3xl">
            <div className="mb-5">
                <label htmlFor="price" className="mb-3 block text-base font-medium text-[#07074D]">
                    Montant à payer :
                </label>
                <input
                    type="number"
                    name="price"
                    id="price"
                    placeholder="prix..."
                    value={price}
                    onChange={handlePriceChange}
                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
                {formErrors.price && (
                    <div
                        className="mt-4 bg-red-400 rounded-xl text-xs text-gray-700 p-2 flex flex-nowrap gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4"
                             fill="none" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2 a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p>{formErrors.price}</p>
                    </div>
                )}
            </div>

        </div>
    );
}

export default Cash;
