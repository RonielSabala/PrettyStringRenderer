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

type Dimensions = {
  width: number;
  height: number;
};

// Private helpers

function _getNormalizedDimension(n: number): string {
  return toPx(Math.max(1, Math.ceil(n)));
}

function _getOptimalFontSize(
  availableWidth: number,
  availableHeight: number,
): number {
  const config = getStore().typographyConfig;
  const fontDefaults = TYPOGRAPHY_DEFAULTS.fontSize;
  const { tokenizer } = getStore();
  const linesCount = tokenizer.linesCount;
  const longestLine = tokenizer.longestLine;

  if (linesCount === 0 || longestLine === 0) {
    return fontDefaults.value;
  }

  // Compute character width metric at unit font size
  updateTextMetrics({ ...config, fontSize: 1 });

  const widthCoefficient = longestLine * charWidthMetric!;
  const heightCoefficient = linesCount * config.lineHeight;

  const optimalFontSizeByWidth = Math.ceil(
    (availableWidth - 2 * config.padX) / widthCoefficient,
  );
  const optimalFontSizeByHeight = Math.ceil(
    (availableHeight - 2 * config.padY) / heightCoefficient,
  );

  const optimalFontSize = Math.min(
    optimalFontSizeByWidth,
    optimalFontSizeByHeight,
  );

  return Math.min(
    fontDefaults.max,
    Math.max(fontDefaults.min, optimalFontSize),
  );
}

function _getPixelScale(
  availableWidth: number,
  availableHeight: number,
  fitToContent: boolean,
): number {
  const zoom = getStore().canvasConfig.zoom;
  let pixelScale = zoom;

  // Apply font size factor
  if (fitToContent) {
    const minFontSize = TYPOGRAPHY_DEFAULTS.fontSize.min;
    const fontSize = getStore().typographyConfig.fontSize;
    const optimalFontSize = _getOptimalFontSize(
      availableWidth,
      availableHeight,
    );

    const fontRange = optimalFontSize - minFontSize;
    const pixelScaleRange = CANVAS_MAX_PIXEL_SCALE - CANVAS_MIN_PIXEL_SCALE;
    const fontProgress = Math.min(1, (fontSize - minFontSize) / fontRange);

    pixelScale *= CANVAS_MAX_PIXEL_SCALE - fontProgress * pixelScaleRange;
  }

  return Math.min(
    CANVAS_MAX_PIXEL_SCALE,
    Math.max(CANVAS_MIN_PIXEL_SCALE, Math.ceil(pixelScale)),
  );
}

function _calculateFitDimensions(): Dimensions {
  const config = getStore().typographyConfig;
  const { tokenizer } = getStore();

  updateTextMetrics(config);
  return {
    width: Math.ceil(
      2 * config.padX + tokenizer.longestLine * charWidthMetric!,
    ),
    height: Math.ceil(
      2 * config.padY +
        tokenizer.linesCount * config.lineHeight * config.fontSize,
    ),
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

  function getAvailableDimensions(): Dimensions {
    return {
      width: canvasWrapElement.clientWidth - CANVAS_VIEWPORT_PADDING_PX,
      height: canvasWrapElement.clientHeight - CANVAS_VIEWPORT_PADDING_PX,
    };
  }

  function adjustCanvas(pixelScale: number | null = null): void {
    const { width: availableWidth, height: availableHeight } =
      getAvailableDimensions();

    let displayWidth: number;
    let displayHeight: number;

    if (getStore().canvasConfig.fitToContent) {
      const canvasPixelScale =
        pixelScale ?? _getPixelScale(availableWidth, availableHeight, true);
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

  function redraw(forceAdjust = false, pixelScale?: number): void {
    const { canvasConfig } = getStore();
    const fitToContent = canvasConfig.fitToContent;

    const { width, height } = fitToContent
      ? _calculateFitDimensions()
      : CANVAS_DEFAULTS;

    if (pixelScale === undefined) {
      const { width: availableWidth, height: availableHeight } =
        getAvailableDimensions();

      pixelScale = _getPixelScale(
        availableWidth,
        availableHeight,
        fitToContent,
      );
    }

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
    const fitToContent = getStore().canvasConfig.fitToContent;
    const { width, height } = getAvailableDimensions();
    const pixelScale = _getPixelScale(width, height, fitToContent);

    if (pixelScale === _currentPixelScale) {
      return;
    }

    destroy();
    _redrawTimer = setTimeout(
      () => redraw(undefined, pixelScale),
      CANVAS_REDRAW_TIMEOUT_MS,
    );
  }

  return { redraw, scheduleRedraw, adjustCanvas, destroy };
}
