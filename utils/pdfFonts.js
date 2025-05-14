export const registerFonts = (doc) => {
    // These are placeholder values - replace with actual Base64 encoded fonts
    const fonts = {
        'Amiri-Regular': 'BASE64_REGULAR_FONT',
        'Amiri-Bold': 'BASE64_BOLD_FONT'
    };

    if (!doc.getFontList().includes('Amiri')) {
        Object.entries(fonts).forEach(([name, data]) => {
            doc.addFileToVFS(`${name}.ttf`, data);
            doc.addFont(`${name}.ttf`, 'Amiri', name.includes('Bold') ? 'bold' : 'normal');
        });
    }
};

// Helper to convert ArrayBuffer to Base64
export const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};