import React, {useEffect, useState} from 'react';
import Barcode from 'react-barcode';
import {useSession} from "next-auth/react";

const ProductPrintable = ({dataProduct, componentRef, formData}) => {

    return (
        <div ref={componentRef} className="printable-content w-[72mm] h-[10mm] hidden print:block">
            <div className="flex h-full" style={{fontSize: '3mm'}}>
                {dataProduct && dataProduct.code && (
                    <>
                        <div
                            style={{
                                width: '20mm',
                                marginRight: '4mm',
                                marginLeft: '2mm',
                                alignItems: 'center',
                                display: 'flex',
                                justifyContent: 'space-around',
                                flexDirection: 'column',
                                maxWidth: '20mm',
                                marginTop:'2mm'
                            }}
                        >
                            <Barcode
                                value={dataProduct.code.padStart(2, '0')}
                                height={40}
                                width={2}
                                displayValue={false}
                                margin={0}

                            />
                           <p              style={{

                               fontSize: '2mm',
                           }}
                              >{dataProduct.code.padStart(2, '0')}</p>

                        </div>
                        <div
                            style={{
                                width: '20mm',
                                maxHeight: '8mm',
                                display: 'flex',
                                alignItems: 'start',
                                flexDirection: 'column',
                                marginTop: '2mm',
                                fontSize: '2mm',
                            }}
                        >

                            <div className="m-0 p-0">{dataProduct.model}</div>
                            <div className="m-0 p-0 text-[9px]">
                                26{dataProduct.weight.toString().replace('.', '')}18 / {dataProduct.carat}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductPrintable;
