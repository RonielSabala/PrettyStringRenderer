export function parseNumber(value, fallback) {
    const number = parseFloat(value);
    return isNaN(number) ? fallback : number;
}