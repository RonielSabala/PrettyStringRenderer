import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  type ReactNode,
} from "react";
import { FileEarmarkImage, FileEarmarkRichtext } from "react-bootstrap-icons";
import {
  getDrawingContext,
  iterateTokens,
  render,
} from "../../canvas/renderer";
import {
  APP_FONT_VARIANT_LIGATURES,
  CANVAS_DEFAULTS,
  DEFAULT_EXPORT_IMAGE_FILENAME,
  PNG_BLOB_TYPE,
  PNG_EXTENSION,
  SVG_BLOB_TYPE,
  SVG_EXTENSION,
  SVG_NS,
} from "../../common/config";
import { CSS_STYLE, CSS_TEXT_RENDERING } from "../../common/constants/css";
import { EVENTS } from "../../common/constants/events";
import { matchesKeybinding } from "../../common/keybindings";
import { useStore } from "../../common/store";
import type {
  CanvasConfig,
  ThemeColors,
  TypographyConfig,
} from "../../common/types";
import { roundUp } from "../../utils/parse";
import { createResolution, getScaledDimensions } from "../../utils/resolution";
import { Dialog } from "../dialog";
import "./ExportDialog.css";
import PNGExportModal from "./PNGExportModal";
import SVGExportModal from "./SVGExportModal";

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

function _exportPNG(
  canvasConfig: CanvasConfig,
  typographyConfig: TypographyConfig,
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
  offscreen.style.visibility = CSS_STYLE.HIDDEN;
  offscreen.style.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;

  render(getDrawingContext(offscreen), exportWidth, exportHeight, scaledConfig);

  offscreen.toBlob((blob) => {
    if (blob) {
      _download(blob, filename);
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
  filename: string,
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
  _download(blob, filename);
}

// Sub-component

interface ExportFormatButtonProps {
  label: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}

function ExportFormatButton({
  label,
  description,
  icon,
  onClick,
}: ExportFormatButtonProps) {
  return (
    <button className="action-btn export-format-btn" onClick={onClick}>
      {icon}
      <div className="export-btn-content">
        <p className="export-btn-label no-user-select">{label}</p>
        <p className="export-btn-description no-user-select">{description}</p>
      </div>
    </button>
  );
}

// Main Component

export interface ExportDialogHandle {
  open: () => void;
  close: () => void;
}

export const ExportDialog = forwardRef<ExportDialogHandle>((_, ref) => {
  const typographyConfig = useStore((state) => state.typographyConfig);
  const canvasConfig = useStore((state) => state.canvasConfig);
  const colors = useStore((state) => state.colors);
  const [isOpen, setIsOpen] = useState(false);
  const [isPNGModalOpen, setIsPNGModalOpen] = useState(false);
  const [isSVGModalOpen, setIsSVGModalOpen] = useState(false);

  // Expose open/close methods
  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [],
  );

  // Component helpers

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handlers

  const handlePNGClick = useCallback(() => {
    closeDialog();
    setIsPNGModalOpen(true);
  }, [closeDialog]);

  const handleSVGClick = useCallback(() => {
    closeDialog();
    setIsSVGModalOpen(true);
  }, [closeDialog]);

  const handlePNGExport = useCallback(
    (scalar: number, filename: string) => {
      setIsPNGModalOpen(false);
      _exportPNG(canvasConfig, typographyConfig, scalar, filename);
    },
    [canvasConfig, typographyConfig],
  );

  const handleSVGExport = useCallback(
    (filename: string) => {
      setIsSVGModalOpen(false);
      _exportSVG(canvasConfig, typographyConfig, colors, filename);
    },
    [canvasConfig, typographyConfig, colors],
  );

  // Global keybindings
  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      if (matchesKeybinding(event, "workspace.export")) {
        event.preventDefault();
        openDialog();
      } else if (event.key === EVENTS.ESCAPE) {
        closeDialog();
      }
    };

    document.addEventListener(EVENTS.KEY_DOWN, handler);
    return () => document.removeEventListener(EVENTS.KEY_DOWN, handler);
  }, [openDialog, closeDialog]);

  const { width, height } = canvasConfig;
  return (
    <>
      <Dialog isOpen={isOpen} title="Export" onClose={closeDialog}>
        <div className="export-dialog-actions">
          <ExportFormatButton
            label="PNG"
            description="Raster image"
            icon={<FileEarmarkImage size={20} />}
            onClick={handlePNGClick}
          />
          <ExportFormatButton
            label="SVG"
            description="Vector image"
            icon={<FileEarmarkRichtext size={20} />}
            onClick={handleSVGClick}
          />
        </div>
      </Dialog>

      <PNGExportModal
        isOpen={isPNGModalOpen}
        canvasWidth={width}
        canvasHeight={height}
        defaultFilename={_getFilename(width, height, PNG_EXTENSION)}
        onExport={handlePNGExport}
        onCancel={() => setIsPNGModalOpen(false)}
      />

      <SVGExportModal
        isOpen={isSVGModalOpen}
        defaultFilename={_getFilename(width, height, SVG_EXTENSION)}
        onExport={handleSVGExport}
        onCancel={() => setIsSVGModalOpen(false)}
      />
    </>
  );
});

export default ExportDialog;
