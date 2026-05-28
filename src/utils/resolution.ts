export function toPx(amount: number): string {
  return `${amount}px`;
}

export function createResolution(width: number, height: number): string {
  return `${width}x${height}`;
}

export function getScaledDimensions(
  width: number,
  height: number,
  scalar: number,
): [number, number] {
  return [Math.round(scalar * width), Math.round(scalar * height)];
}
