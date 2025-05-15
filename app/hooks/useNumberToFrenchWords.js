// hooks/useNumberToFrenchWords.js
const units = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'
];

const teens = [
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
];

const tens = [
    '', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'
];

const largeNumbers = [
    'mille', 'million', 'milliard'
];

const convertToFrench = (number) => {
    if (number === 0) return 'zéro';

    let parts = [];

    const getBelowThousand = (num) => {
        if (num === 0) return '';

        if (num < 10) return units[num];

        if (num < 20) return teens[num - 10];

        if (num < 100) {
            if (num % 10 === 0) return tens[Math.floor(num / 10)];
            if (num < 70 || (num >= 80 && num < 90)) {
                return `${tens[Math.floor(num / 10)]}${num % 10 === 1 ? ' et un' : '-' + units[num % 10]}`;
            }
            if (num < 80) {
                return `soixante-${teens[num % 10]}`;
            }
            return `quatre-vingt-${units[num % 10]}`;
        }

        const rem = num % 100;
        const div = Math.floor(num / 100);
        if (rem === 0) return div === 1 ? 'cent' : `${units[div]} cents`;
        if (div === 1) return `cent ${getBelowThousand(rem)}`;
        return `${units[div]} cent ${getBelowThousand(rem)}`;
    };

    let index = 0;
    while (number > 0) {
        const chunk = number % 1000;
        if (chunk > 0) {
            let chunkStr = getBelowThousand(chunk);
            if (index > 0) {
                chunkStr += ` ${largeNumbers[index - 1]}`;
                if (chunk > 1 && index === 1) {
                    chunkStr += 's';
                }
            }
            parts.unshift(chunkStr);
        }
        number = Math.floor(number / 1000);
        index++;
    }

    return parts.join(' ').trim();
};

const useNumberToFrenchWords = (number) => {
    return convertToFrench(number);
};

export default useNumberToFrenchWords;
