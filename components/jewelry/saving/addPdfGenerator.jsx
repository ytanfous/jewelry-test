"use client";
import React, {useEffect, useRef, useState} from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SvgIcon from "@/components/UI/SvgIcon";
import {ImCross} from "react-icons/im";
import {useSession} from "next-auth/react";
import useNumberToFrenchWords from "@/app/hooks/useNumberToFrenchWords";
import ReactDOMServer from 'react-dom/server';

const addPdfGenerator = ({formData,updatedClientCode}) => {
    const {data: session} = useSession();
    const pdfRef = useRef(null);
    const [price, setPrice] = useState(formData?.amount);
    const numberAsWord = useNumberToFrenchWords(parseInt(formData?.amount));

    const [userData, setUserData] = useState({
        CompanyName: "",
        name: "",
        location: "",
        email: "",
        phone: "",
    });



    useEffect(() => {
        if (session && session.user) {
            const fetchData = async () => {
                try {
                    const response = await fetch(
                        `/api/register/getUser?userId=${session.user.id}`
                    );
                    const userData = await response.json();

                    setUserData({
                        location: userData.location || "",
                        CompanyName: userData.CompanyName || "",
                        name: userData.name || "",
                        email: userData.email || "",
                        phone: userData.phone || "",
                    });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };
            fetchData();
        }
    }, [session]);

    const svgIconString = ReactDOMServer.renderToString(<SvgIcon/>);


    const generatePDF = async () => {
        const pdf = new jsPDF('landscape', 'mm', 'a5');
        const rowsPerPage = 8;
        const pages = Math.ceil(1);
        const svgIconString = ReactDOMServer.renderToString(<SvgIcon/>);

        for (let i = 0; i < pages; i++) {


            const contentHtml = `
            <div style="width: 210mm; height: 148mm; padding: 5mm; box-sizing: border-box; position: relative;">
                <div class="w-full text-[12px]">
                    <div class="w-full mx-auto">
                        <div class="flex flex-col bg-white rounded-xl">
                            <div class="flex justify-between">
                                ${svgIconString}
                                <div class="text-end">
                                
                            ${updatedClientCode ? `<h2 class="text-xl font-semibold text-gray-800">Code Client # <span class="mt-1 text-gray-500">${updatedClientCode}</span></h2>` : ''}
                                    <h2 class="text-xl font-semibold text-gray-800">Historique
                                        # <span class="mt-1 text-gray-500">${formData.code}</span></h2>
                                    <address class="mt-2 not-italic text-gray-800">
                                        ${userData.CompanyName || ''}
                                        ${userData.location ? `<br><span class="text-[12px]">${userData.location}</span><br>` : ''}
                                    </address>
                                </div>
                            </div>
                        </div>
                        <div class="mt-2 grid sm:grid-cols-2 gap-1">
                            ${(formData.name || formData.phone) ? `
                            <div>
                                <h3 class="text-[12px] font-semibold text-gray-800">L'historique pour : <span
                                    class="text-[14px] font-semibold text-gray-800">${formData.name}</span></h3>
                                <address class="not-italic text-gray-500">
                                    ${formData.phone ? `<span class="font-semibold">Tél :</span> ${formattedPhone}<br>` : ''}
                                </address>
                            </div>` : ''}
                        </div>
                        <div class="mt-2">
                            <div class="border border-gray-700 p-0.5 rounded mb-2">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr class="">
                                            <th scope="col" class="px-1 text-center text-[14px] font-bold text-gray-500 uppercase">
                                                <div class="pb-2">N°</div>
                                            </th>
                                            <th scope="col" class="px-1 text-[12px] font-bold text-gray-500 uppercase">
                                                <div class="pb-2">Montant</div>
                                            </th>
                                            <th scope="col" class="px-1 text-[12px] font-bold text-gray-500 uppercase">
                                                <div class="pb-2">Date</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-300">
                           
                                            <tr class="divide-x text-center divide-gray-300">
                                                <td class="whitespace-nowrap">
                                                    <p class="text-[12px] text-gray-800 mb-1">1</p>
                                                </td>
                                                <td class=" whitespace-nowrap">
                                                    <p class="text-[12px] text-gray-800 mb-1">${formData.amount}</p>
                                                </td>
                                                <td class="whitespace-nowrap">
                                                    <p class="text-[12px] text-gray-800 mb-1">${formatDate(formData.createdAt)}</p>
                                                </td>
                                            </tr>
                          
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        ${i === pages - 1 ? `
                            <div class="mt-2 flex flex-col justify-end">
                                <div class="w-full text-end space-y-1 flex justify-end">
                                    <div class="grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-1">
                                        <dl class="grid sm:grid-cols-5 gap-x-1">
                                            <dt class="col-span-3 font-semibold text-gray-800">Montant :</dt>
                                            <dd class="col-span-2 text-gray-500">${price} DT</dd>
                                        </dl>
                                    </div>
                                </div>
                                <p class="text-[12px] mt-2 text-gray-800">Le montant est de ${numberAsWord} Dinar Tunisien.</p>
                            </div>
                            <div class="mt-2">
                                <h4 class="font-semibold text-gray-800">Merci!</h4>
                                ${(userData.email || userData.phone) ?
                `<p class="text-gray-500 text-[10px]">Si vous avez des questions concernant cette historique, utilisez les coordonnées suivantes:</p>` : ''}
                                <div class="mt-1">
                                    ${userData.email ? `<p class="block font-medium text-[10px] text-gray-800">${userData.email}</p>` : ''}
                                    ${userData.phone ? `<p class="block font-medium text-[10px] text-gray-800">${userData.phone}</p>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

            pdfRef.current.innerHTML = contentHtml;

            try {
                const canvas = await html2canvas(pdfRef.current, {
                    scale: 2, // Adjust scale if necessary
                    useCORS: true,
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0); // Adjust quality if needed

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                const imgWidth = pageWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Calculate y coordinate to center the image vertically
                const y = (pageHeight - imgHeight) / 2;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', -5, y, imgWidth, imgHeight);

                // Add page number to the PDF
                pdf.setFontSize(10);
                pdf.text(`Page ${i + 1} sur ${pages}`, pageWidth - 25, pageHeight - 10);

                if (i === pages - 1) {
                    const filename = `historique-${formData.code}.pdf`;
                    pdf.save(filename);
                }
            } catch (error) {
                console.error('Error generating PDF:', error);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} à ${hours}:${minutes}`;
    };

    const formattedPhone = formData.phone?.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3");

    return (
        <>
            <div className="flex  justify-end gap-1">
                <button onClick={() => {
                    window.location.reload()
                }}
                        className="mt-4 p-2 pl-4 pr-4 bg-green-500 text-white hover:bg-green-400 rounded">Créer une
                    nouvelle Ma7lol
                </button>
                <button onClick={generatePDF}
                        className="mt-4 p-2 pl-4 pr-4 bg-blue-500 text-white hover:bg-blue-400 rounded">Générer un PDF
                </button>
            </div>
            <div ref={pdfRef} style={{width: "210mm", padding: "5mm", boxSizing: "border-box"}}>
                <div>
                    <div className="w-full text-[12px]">
                        <div className="w-full mx-auto">
                            <div className="flex flex-col bg-white rounded-xl">
                                <div className="flex justify-between">
                                    <SvgIcon/>
                                    <div className="text-end">
                                        {updatedClientCode && <h2 className="text-xl font-semibold text-gray-800">Code Client
                                            # <span className="mt-1 text-gray-500">{updatedClientCode}</span></h2>}
                                        <h2 className="text-xl font-semibold text-gray-800">Historique
                                            # <span className="mt-1 text-gray-500">{formData.code}</span></h2>
                                        <address className="mt-2 not-italic text-gray-800">
                                            {userData.CompanyName && <>{userData.CompanyName}</>}
                                            {userData.location && <>, <br/> <span
                                                className="text-[12px]">{userData.location}</span> <br/></>}
                                        </address>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 grid sm:grid-cols-2 gap-1">
                                {(formData.name || formData.phone) && <div>
                                    <h3 className="text-[12px] font-semibold text-gray-800">L'historique pour : <span
                                        className="text-[14px] font-semibold text-gray-800">{formData.name}</span></h3>
                                    <address className="not-italic text-gray-500">
                                        {formData.phone && <><span
                                            className="font-semibold">Tél :</span> {formattedPhone} </>}<br/>
                                    </address>
                                </div>}
                            </div>
                            <div className="mt-2">
                                <div className="border border-gray-700 p-0.5 rounded mb-2">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr className="">
                                            <th scope="col"
                                                className="px-1 text-center text-[14px] font-bold text-gray-500 uppercase">
                                                <div className="pb-2">N°</div>
                                            </th>
                                            <th scope="col"
                                                className="px-1 text-[12px] font-bold text-gray-500 uppercase">
                                                <div className="pb-2">Montant</div>
                                            </th>
                                            <th scope="col"
                                                className="px-1 text-[12px] font-bold text-gray-500 uppercase">
                                                <div className="pb-2">Date</div>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-300">

                                            <tr  className="divide-x text-center divide-gray-300">
                                                <td className="px-1 py-1 whitespace-nowrap">
                                                    <p className="text-[12px] text-gray-800 pb-1">1</p>
                                                </td>
                                                <td className="px-1 py-1 whitespace-nowrap">
                                                    <p className="text-[12px] text-gray-800 pb-1">{formData.amount}</p>
                                                </td>

                                                <td className="px-1 py-1 whitespace-nowrap">
                                                    <p className="text-[12px] text-gray-800 pb-1">{formatDate(formData.createdAt)}</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {price && <div className="mt-2 flex flex-col justify-end">
                                <div className="w-full text-end space-y-1 flex justify-end">
                                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-1">
                                        <dl className="grid sm:grid-cols-5 gap-x-1">
                                            <dt className="col-span-3 font-semibold text-gray-800">Montant :</dt>
                                            <dd className="col-span-2 text-gray-500">{price} DT</dd>
                                        </dl>
                                    </div>
                                </div>
                                <p className="text-[12px] mt-2 text-gray-800">Le montant est de
                                    {numberAsWord} Dinar Tunisien.</p>
                            </div>}
                            <div className="mt-2">
                                <h4 className="font-semibold text-gray-800">Merci!</h4>
                                {(userData.email || userData.phone) &&
                                    <p className="text-gray-500 text-[10px]">Si vous avez des questions concernant cette
                                        historique, utilisez les coordonnées suivantes:</p>}
                                <div className="mt-1">
                                    {userData.email &&
                                        <p className="block font-medium text-[10px] text-gray-800">{userData.email}</p>}
                                    {userData.phone &&
                                        <p className="block font-medium text-[10px] text-gray-800">{userData.phone}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default addPdfGenerator;
