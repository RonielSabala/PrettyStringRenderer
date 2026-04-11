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

export function toTitle(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function camelToKebab(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
}

export function camelToTitle(string) {
    return string
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase());
}
