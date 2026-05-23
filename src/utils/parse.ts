export function isObjectEmpty(object: object): boolean {
  return Object.keys(object).length === 0;
}

export function parseNumber(
  value: string | null | undefined,
  fallback: number,
): number {
  const number = parseFloat(value ?? "");
  return isNaN(number) ? fallback : number;
}

export function roundUp(num: number, decimals: number = 2): number {
  const factor = 10 ** decimals;
  return Math.ceil(num * factor) / factor;
}

export function toTitle(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function titleToKebab(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function camelToKebab(text: string): string {
  return text.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function camelToTitle(text: string): string {
  return text.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export function centerString(str: string, width: number): string {
  const padding = Math.max(0, width - str.length);
  const leftPad = Math.floor(padding / 2);
  return " ".repeat(leftPad) + str;
}

export function centerStringArray(
  array: readonly string[],
  width: number,
): string[] {
  const longestLine = Math.max(0, ...array.map((line) => line.length));
  const padding = Math.max(0, Math.floor((width - longestLine) / 2));
  const leftPad = " ".repeat(padding);
  return array.map((line) => leftPad + line);
}
