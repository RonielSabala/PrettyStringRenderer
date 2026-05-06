import { forwardRef, useCallback, useEffect } from "react";
import { getDrawingContext, iterateTokens, render } from "../canvas/renderer";
import {
  APP_FONT_VARIANT_LIGATURES,
  CANVAS_DEFAULTS,
  DEFAULT_EXPORT_IMAGE_FILENAME,
  DEFAULT_PNG_SCALAR,
  EXPORT_PNG_PROMPT_MESSAGE,
  EXPORT_PNG_PROMPT_SCALAR_EXAMPLES,
  LINE_BREAK,
  PNG_BLOB_TYPE,
  PNG_EXTENSION,
  SVG_BLOB_TYPE,
  SVG_EXTENSION,
  SVG_NS,
} from "../common/config";
import { CSS_STYLE, CSS_TEXT_RENDERING } from "../common/constants/css";
import { EVENTS } from "../common/constants/events";
import { matchesKeybinding } from "../common/keybindings";
import { useStore } from "../common/store";
import type {
  CanvasConfig,
  ThemeColors,
  TypographyConfig,
} from "../common/types";
import { parseNumber, roundUp } from "../utils/parse";
import { createResolution, getScaledDimensions } from "../utils/resolution";
import "./ExportDialog.css";

// Private helpers

function _getFilename(width: number, height: number, ext: string): string {
  return `${DEFAULT_EXPORT_IMAGE_FILENAME}-${createResolution(width, height)}${ext}`;
}

function _download(blob: Blob, filename: string): void {
  const anchorElement = document.createElement("a");
  anchorElement.href = URL.createObjectURL(blob);
  anchorElement.download = filename;
  anchorElement.click();
  URL.revokeObjectURL(anchorElement.href);
}

// PNG exporter

function _formatScalarExample(
  scalar: number,
  width: number,
  height: number,
): string {
  const resolution = createResolution(
    ...getScaledDimensions(width, height, scalar),
  );

  return `* ${scalar} -> ${resolution}`;
}

function _exportPNG(
  canvasConfig: CanvasConfig,
  typographyConfig: TypographyConfig,
): void {
  const { width, height } = canvasConfig;
  const promptMsg = [
    EXPORT_PNG_PROMPT_MESSAGE,
    ...EXPORT_PNG_PROMPT_SCALAR_EXAMPLES.map((scalar) =>
      _formatScalarExample(scalar, width, height),
    ),
  ].join(LINE_BREAK);

  const scalar = parseNumber(prompt(promptMsg, String(DEFAULT_PNG_SCALAR)), 0);
  if (scalar <= 0) {
    return;
  }

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
  offscreen.style.visibility = CSS_STYLE.HIDDEN;
  offscreen.style.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;

  render(getDrawingContext(offscreen), exportWidth, exportHeight, scaledConfig);

  offscreen.toBlob((blob) => {
    if (blob) {
      _download(blob, _getFilename(exportWidth, exportHeight, PNG_EXTENSION));
    }

    document.body.removeChild(offscreen);
  }, PNG_BLOB_TYPE.type);
}

// SVG exporter

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

function _exportSVG(
  canvasConfig: CanvasConfig,
  typographyConfig: TypographyConfig,
  colors: ThemeColors,
): void {
  const { width, height } = canvasConfig;
  const renderConfig = {
    ...typographyConfig,
    textRendering: CSS_TEXT_RENDERING.GEOMETRIC_PRECISION,
  };

  // Svg parts

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

  // Build svg

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
  _download(blob, _getFilename(width, height, SVG_EXTENSION));
}

// Component

export const ExportDialog = forwardRef<HTMLDialogElement>((_, ref) => {
  const typographyConfig = useStore((state) => state.typographyConfig);
  const canvasConfig = useStore((state) => state.canvasConfig);
  const colors = useStore((state) => state.colors);

  // Component helpers

  const openDialog = useCallback(() => {
    (ref as React.RefObject<HTMLDialogElement>).current?.showModal();
  }, [ref]);

  const closeDialog = useCallback(() => {
    (ref as React.RefObject<HTMLDialogElement>).current?.close();
  }, [ref]);

  // Handlers

  const handlePNG = useCallback(() => {
    closeDialog();
    _exportPNG(canvasConfig, typographyConfig);
  }, [closeDialog, canvasConfig, typographyConfig]);

  const handleSVG = useCallback(() => {
    closeDialog();
    _exportSVG(canvasConfig, typographyConfig, colors);
  }, [closeDialog, canvasConfig, typographyConfig, colors]);

  const handleDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) {
        closeDialog();
      }
    },
    [closeDialog],
  );

  // Global keybindings
  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      if (matchesKeybinding(event, "export.open")) {
        event.preventDefault();
        openDialog();
      } else if (matchesKeybinding(event, "export.close")) {
        closeDialog();
      }
    };

    document.addEventListener(EVENTS.KEY_DOWN, handler);
    return () => document.removeEventListener(EVENTS.KEY_DOWN, handler);
  }, [openDialog, closeDialog]);

  return (
    <dialog id="dialog-export" ref={ref} onClick={handleDialogClick}>
      <p className="dialog-title no-select">Export canvas as</p>
      <div className="dialog-actions">
        <button
          id="btn-export-png"
          className="btn no-select"
          type="button"
          onClick={handlePNG}
        >
          PNG
        </button>
        <button
          id="btn-export-svg"
          className="btn no-select"
          type="button"
          onClick={handleSVG}
        >
          SVG
        </button>
      </div>
    </dialog>
  );
});

export default ExportDialog;
