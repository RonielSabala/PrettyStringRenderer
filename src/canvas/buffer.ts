import {
  CANVAS_DEFAULTS,
  CANVAS_MAX_PIXEL_SCALE,
  CANVAS_MIN_PIXEL_SCALE,
  CANVAS_REDRAW_TIMEOUT_MS,
  CANVAS_VIEWPORT_PADDING_PX,
  TYPOGRAPHY_DEFAULTS,
} from "../common/config";
import { getStore } from "../common/store";
import { toPx } from "../utils/resolution";
import {
  charWidthMetric,
  getDrawingContext,
  render,
  updateTextMetrics,
} from "./renderer";

// Private helpers

function _getPixelScale(): number {
  const zoom = getStore().canvasConfig.zoom;
  const fontSize = getStore().typographyConfig.fontSize;
  const minFontSize = TYPOGRAPHY_DEFAULTS.fontSize.min;
  const defaultFontSize = TYPOGRAPHY_DEFAULTS.fontSize.value;

  // Intervals
  const fontRange = defaultFontSize - minFontSize;
  const pixelScaleRange = CANVAS_MAX_PIXEL_SCALE - CANVAS_MIN_PIXEL_SCALE;

  // Base pixel scale determined by font size
  const fontProgress = Math.min(1, (fontSize - minFontSize) / fontRange);
  const basePixelScale =
    CANVAS_MAX_PIXEL_SCALE - fontProgress * pixelScaleRange;

  // Apply zoom factor
  const pixelScale = Math.ceil(basePixelScale * zoom);
  const normalizedPixelScale = Math.min(
    CANVAS_MAX_PIXEL_SCALE,
    Math.max(CANVAS_MIN_PIXEL_SCALE, pixelScale),
  );

  return normalizedPixelScale;
}

function _getNormalizedDimension(n: number): string {
  return toPx(Math.max(1, Math.ceil(n)));
}

function _calculateFitDimensions(): { width: number; height: number } {
  const config = getStore().typographyConfig;
  updateTextMetrics(config);

  const { tokenizer } = getStore();
  const lineHeight = config.fontSize * config.lineHeight;
  return {
    width: Math.ceil(config.padX * 2 + tokenizer.maxLine * charWidthMetric!),
    height: Math.ceil(config.padY * 2 + tokenizer.linesCount * lineHeight),
  };
}

// Canvas buffer

export interface CanvasBuffer {
  redraw: (forceAdjust?: boolean) => void;
  scheduleRedraw: () => void;
  adjustCanvas: (pixelScale?: number | null) => void;
  destroy: () => void;
}

export function createBuffer(
  canvasElement: HTMLCanvasElement,
  canvasWrapElement: HTMLElement,
  onDimensionsChange: (width: number, height: number) => void,
): CanvasBuffer {
  const ctx = getDrawingContext(canvasElement);

  let _currentPixelScale = 1;
  let _redrawTimer: ReturnType<typeof setTimeout> | null = null;

  let _lastBufferWidth: number | null = null;
  let _lastBufferHeight: number | null = null;

  function adjustCanvas(pixelScale: number | null = null): void {
    const availableWidth =
      canvasWrapElement.clientWidth - CANVAS_VIEWPORT_PADDING_PX;
    const availableHeight =
      canvasWrapElement.clientHeight - CANVAS_VIEWPORT_PADDING_PX;

    let displayWidth: number;
    let displayHeight: number;

    if (getStore().canvasConfig.fitToContent) {
      const canvasPixelScale = pixelScale ?? _getPixelScale();
      const bufferWidth = canvasElement.width / canvasPixelScale;
      const bufferHeight = canvasElement.height / canvasPixelScale;
      const scale = Math.min(
        availableWidth / bufferWidth,
        availableHeight / bufferHeight,
      );

      displayWidth = scale * bufferWidth;
      displayHeight = scale * bufferHeight;
    } else {
      const aspectRatio = CANVAS_DEFAULTS.aspectRatio;
      displayWidth = Math.min(availableWidth, availableHeight * aspectRatio);
      displayHeight = Math.min(availableHeight, displayWidth / aspectRatio);
    }

    canvasElement.style.width = _getNormalizedDimension(displayWidth);
    canvasElement.style.height = _getNormalizedDimension(displayHeight);
  }

  function redraw(forceAdjust = false): void {
    const { canvasConfig } = getStore();
    const fitToContent = canvasConfig.fitToContent;
    const { width, height } = fitToContent
      ? _calculateFitDimensions()
      : CANVAS_DEFAULTS;

    const pixelScale = _getPixelScale();
    _currentPixelScale = pixelScale;

    const bufferWidth = pixelScale * width;
    const bufferHeight = pixelScale * height;
    const sizeChanged =
      bufferWidth !== _lastBufferWidth || bufferHeight !== _lastBufferHeight;

    if (sizeChanged) {
      _lastBufferWidth = bufferWidth;
      _lastBufferHeight = bufferHeight;
      canvasElement.width = bufferWidth;
      canvasElement.height = bufferHeight;
      ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
    }

    render(ctx, width, height);

    if (forceAdjust || (sizeChanged && fitToContent)) {
      adjustCanvas(pixelScale);
      onDimensionsChange(width, height);
    }
  }

  function destroy(): void {
    if (_redrawTimer !== null) {
      clearTimeout(_redrawTimer);
    }
  }

  function scheduleRedraw(): void {
    if (_currentPixelScale === _getPixelScale()) {
      return;
    }

    destroy();
    _redrawTimer = setTimeout(redraw, CANVAS_REDRAW_TIMEOUT_MS);
  }

  return { redraw, scheduleRedraw, adjustCanvas, destroy };
}
