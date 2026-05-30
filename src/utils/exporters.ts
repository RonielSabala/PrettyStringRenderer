import { getDrawingContext, iterateTokens, render } from "../canvas/renderer";
import {
  APP_FONT_VARIANT_LIGATURES,
  CANVAS_DEFAULTS,
  PNG_BLOB_TYPE,
  SVG_BLOB_TYPE,
  SVG_NS,
} from "../common/config";
import { CSS_TEXT_RENDERING, CSS_VISIBILITY } from "../common/constants/css";
import type {
  CanvasConfig,
  ThemeColors,
  TypographyConfig,
} from "../common/types";
import { roundUp } from "./parse";
import { createResolution, getScaledDimensions } from "./resolution";

// Utilities

export function getFilename(
  width: number,
  height: number,
  defaultFilename: string,
  ext: string,
): string {
  return `${defaultFilename}-${createResolution(width, height)}${ext}`;
}

function _download(blob: Blob, filename: string): void {
  const anchorElement = document.createElement("a");
  anchorElement.href = URL.createObjectURL(blob);
  anchorElement.download = filename;
  anchorElement.click();
  URL.revokeObjectURL(anchorElement.href);
}

// PNG Export

export function exportPNG(
  canvasConfig: CanvasConfig,
  typographyConfig: TypographyConfig,
  colors: ThemeColors,
  scalar: number,
  filename: string,
): void {
  const { width, height } = canvasConfig;
  const [exportWidth, exportHeight] = getScaledDimensions(
    width,
    height,
    scalar,
  );
  const scaledConfig = {
    ...typographyConfig,
    fontSize: typographyConfig.fontSize * scalar,
    letterSpacing: typographyConfig.letterSpacing * scalar,
    padX: typographyConfig.padX * scalar,
    padY: typographyConfig.padY * scalar,
    textRendering: CSS_TEXT_RENDERING.GEOMETRIC_PRECISION,
  };

  const offscreen = document.createElement("canvas");

  // Temporarily append to DOM to ensure the context inherits the styles
  document.body.appendChild(offscreen);
  offscreen.width = exportWidth;
  offscreen.height = exportHeight;
  offscreen.style.visibility = CSS_VISIBILITY.HIDDEN;
  offscreen.style.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;

  const offscreenContext = getDrawingContext(offscreen);
  const backgroundColor = colors.background;
  if (backgroundColor) {
    offscreenContext.fillStyle = backgroundColor;
    offscreenContext.fillRect(0, 0, exportWidth, exportHeight);
  }

  render(offscreenContext, exportWidth, exportHeight, {
    configOverride: scaledConfig,
    clearCanvas: !backgroundColor,
  });

  offscreen.toBlob((blob) => {
    if (blob) {
      _download(blob, filename);
    }

    document.body.removeChild(offscreen);
  }, PNG_BLOB_TYPE.type);
}

// SVG Export

function _setAttrs(
  element: Element,
  attrs: Record<string, string | number>,
): Element {
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, String(value));
  }

  return element;
}

function _svgElement(tag: string): Element {
  return document.createElementNS(SVG_NS, tag);
}

function _svgTextElement(text: string, x: number, y: number): Element {
  const element = _svgElement("text");
  element.textContent = text;

  return _setAttrs(element, { x: roundUp(x), y: roundUp(y) });
}

export function exportSVG(
  canvasConfig: CanvasConfig,
  typographyConfig: TypographyConfig,
  colors: ThemeColors,
  filename: string,
): void {
  const { width, height } = canvasConfig;
  const renderConfig = {
    ...typographyConfig,
    textRendering: CSS_TEXT_RENDERING.GEOMETRIC_PRECISION,
  };

  // SVG parts

  const svgElement = _setAttrs(_svgElement("svg"), {
    xmlns: SVG_NS,
    width: width,
    height: height,
    viewBox: `0 0 ${width} ${height}`,
  });

  // Background
  const backgroundColor = colors.background;
  if (backgroundColor) {
    const pathElement = _setAttrs(_svgElement("path"), {
      fill: backgroundColor,
      d: `M0 0h${width}v${height}H0z`,
    });

    svgElement.append(pathElement);
  }

  // Group
  const groupElement = _setAttrs(_svgElement("g"), {
    "font-size": typographyConfig.fontSize,
    "font-family": CANVAS_DEFAULTS.font,
    "font-weight": CANVAS_DEFAULTS.fontWeight,
    "letter-spacing": typographyConfig.letterSpacing,
  });

  (groupElement as SVGElement).style.fontVariantLigatures =
    APP_FONT_VARIANT_LIGATURES;

  svgElement.append(groupElement);

  // Build SVG

  const batch = new Map<string, { text: string; x: number; y: number }[]>();

  iterateTokens(width, height, renderConfig, (text, color, x, y) => {
    if (!color) {
      return;
    }

    if (!batch.has(color)) {
      batch.set(color, []);
    }

    batch.get(color)!.push({ text, x, y });
  });

  for (const [color, calls] of batch) {
    const isSingle = calls.length === 1;
    const container = isSingle
      ? _svgTextElement(calls[0].text, calls[0].x, calls[0].y)
      : _svgElement("g");

    _setAttrs(container, { fill: color });
    if (!isSingle) {
      container.append(
        ...calls.map((call) => _svgTextElement(call.text, call.x, call.y)),
      );
    }

    groupElement.appendChild(container);
  }

  const svg = (svgElement as Element).outerHTML;
  const blob = new Blob([svg], SVG_BLOB_TYPE);
  _download(blob, filename);
}
