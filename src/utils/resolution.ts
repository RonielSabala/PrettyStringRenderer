export function toPx(amount: number): string {
  return `${amount}px`;
}

export function createResolution(width: number, height: number): string {
  return `${width}x${height}`;
}

export function getCanvasDimensions(
  width: number,
  height: number,
  scalar: number | null = null,
): [number, number] {
  if (scalar !== null) {
    return [Math.round(scalar * width), Math.round(scalar * height)];
  }

  return [width, height];
}
