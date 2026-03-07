export function isObjectEmpty(object) {
    return Object.keys(object).length === 0;
}

export function parseNumber(value, fallback) {
    const number = parseFloat(value);
    return isNaN(number) ? fallback : number;
}

export function roundUp(num, decimals = 2) {
    const factor = 10 ** decimals;
    return Math.ceil(num * factor) / factor;
}