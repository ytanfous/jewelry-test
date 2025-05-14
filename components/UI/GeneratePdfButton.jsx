'use client';

import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const GeneratePdfButton = ({ data, columnsConfig, title = 'Liste des Produits' }) => {
    // Helper function to convert ArrayBuffer to Base64 (works in both browser and Node.js)
    const arrayBufferToBase64 = (buffer) => {
        if (typeof window !== 'undefined' && window.btoa) {
            // Browser environment
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        } else {
            // Node.js environment
            return Buffer.from(buffer).toString('base64');
        }
    };

    // Helper function to check for Arabic text
    const containsArabic = (text) => {
        if (!text) return false;
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    // Value formatter function
    const formatValueForPdf = (key, value) => {
        if (value === null || value === undefined) return '-';

        // Format dates
        if (key.toLowerCase().includes('date') || key === 'createdAt' || key === 'updatedAt') {
            try {
                return new Date(value).toLocaleDateString('fr-FR');
            } catch {
                return value;
            }
        }

        // Format weight with 'g' suffix
        if (key === 'weight') return `${value}g`;

        // Format status in French
        if (key === 'status') {
            const statusMap = {
                'Active': 'Disponible',
                'Lend': 'Prêter',
                'Sold': 'Vendu',
                'Crédit': 'Crédit',
                'Facilité': 'Facilité',
                'deleted': 'Supprimé'
            };
            return statusMap[value] || value;
        }

        return value;
    };

    const getDefaultColumns = (data) => {
        if (!data || data.length === 0) return {};
        const sampleItem = data[0];
        return Object.keys(sampleItem).reduce((acc, key) => {
            if (key !== 'id') {
                acc[key] = key.charAt(0).toUpperCase() + key.slice(1);
            }
            return acc;
        }, {});
    };

    const generatePDF = async () => {
        try {
            // Check if data exists
            if (!data || data.length === 0) {
                throw new Error('No data provided for PDF generation');
            }

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Try to load font, but proceed without it if there's an error
            let fontLoaded = false;
            try {
                const fontResponse = await fetch('/fonts/Amiri/Amiri-Regular.ttf');
                if (!fontResponse.ok) throw new Error('Font not found');

                const fontArrayBuffer = await fontResponse.arrayBuffer();
                const fontBase64 = arrayBufferToBase64(fontArrayBuffer);

                doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
                doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                fontLoaded = true;
            } catch (fontError) {
                console.warn('Failed to load Arabic font, proceeding without it:', fontError);
            }

            // Set document title (top of first page)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(title, 105, 15, { align: 'center' });

            // Prepare data for autoTable
            const columnsToShow = columnsConfig || getDefaultColumns(data);
            const headers = Object.values(columnsToShow);
            const accessors = Object.keys(columnsToShow);

            // Table styles
            const tableStyles = {
                headStyles: {
                    fillColor: [220, 220, 220],
                    textColor: [0, 0, 0],
                    halign: 'center',
                    fontSize: 9,
                    lineColor: [150, 150, 150],
                    lineWidth: 0.1,
                    cellPadding: { top: 2, right: 3, bottom: 2, left: 3 }
                },
                bodyStyles: {
                    textColor: [0, 0, 0],
                    lineColor: [150, 150, 150],
                    lineWidth: 0.2,
                    fontSize: 9,
                    cellPadding: { top: 2, right: 1, bottom: 2, left: 1 }
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                },
                styles: {
                    cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
                    overflow: 'linebreak',
                    font: 'helvetica'
                },
                margin: { top: 20, right: 15, bottom: 30, left: 15 },
                startY: 25
            };

            // Generate the table
            autoTable(doc, {
                head: [headers],
                body: data.map(row => accessors.map(accessor => formatValueForPdf(accessor, row[accessor]))),
                ...tableStyles,
                columnStyles: Object.fromEntries(
                    accessors.map((accessor, idx) => [
                        idx,
                        {
                            halign: 'center',
                            font: (fontLoaded && data.some(row => containsArabic(row[accessor])))
                                ? 'Amiri'
                                : 'helvetica',
                            cellPadding: { top: 2, right: 1, bottom: 2, left: 1 }
                        }
                    ])
                ),
            });

            // Add footer to all pages
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);

                // Footer line
                doc.setDrawColor(150, 150, 150);
                doc.setLineWidth(0.2);
                const footerY = doc.internal.pageSize.height - 10;
                doc.line(15, footerY, 195, footerY);

                // Current date
                const today = new Date();
                const formattedDate = today.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // Add date and page number
                doc.text(formattedDate, 15, footerY + 5, { align: 'left' });
                doc.text(`Page ${i} sur ${pageCount}`, 195, footerY + 5, { align: 'right' });

                // Add title on subsequent pages
                if (i > 1) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(16);
                    doc.text(title, 105, 15, { align: 'center' });
                }
            }

            // Generate filename and save
            const today = new Date();
            const filenameDate = today.toISOString().split('T')[0];
            doc.save(`${title.toLowerCase().replace(/ /g, '-')}-${filenameDate}.pdf`);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert(`Échec de la génération du PDF: ${error.message}`);
        }
    };

    return (
        <button
            onClick={generatePDF}
            className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Générer PDF
        </button>
    );
};

export default GeneratePdfButton;