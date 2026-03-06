export function isObjectEmpty(object) {
    return Object.keys(object).length === 0;
}

export function parseNumber(value, fallback) {
    const number = parseFloat(value);
    return isNaN(number) ? fallback : number;
}