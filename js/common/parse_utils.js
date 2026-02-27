export function parseNumber(htmlElement, fallback) {
    const number = parseFloat(htmlElement.value);
    return isNaN(number) ? fallback.value : number;
}