import {
  CANVAS_DEFAULTS,
  CANVAS_REDRAW_TIMEOUT_MS,
  CANVAS_VIEWPORT_PADDING_PX,
  MAX_CANVAS_BUFFER_PIXELS,
} from "../common/config";
import { getStore } from "../common/store";
import { toPx } from "../utils/resolution";
import {
  charWidthMetric,
  getDrawingContext,
  render,
  updateTextMetrics,
  type RenderOptions,
} from "./renderer";

// Private helpers

function _calculateFitDimensions(): {
  width: number;
  height: number;
} {
  const { typographyConfig: config, tokenizer } = getStore();

  updateTextMetrics(config, tokenizer);
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

// Buffer

export interface RedrawOptions {
  pixelScale?: number;
  forceAdjust?: boolean;
  renderOptions?: RenderOptions;
}

interface CanvasBuffer {
  redraw: (options?: RedrawOptions) => void;
  scheduleRedraw: () => void;
  adjustCanvas: (pixelScale?: number) => void;
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

  let _lastWidth: number | null = null;
  let _lastHeight: number | null = null;
  let _lastBufferWidth: number | null = null;
  let _lastBufferHeight: number | null = null;

  function _getPixelScale(logicalWidth: number, logicalHeight: number): number {
    const zoom = getStore().canvasConfig.zoom;
    const displayScale = Math.min(
      canvasElement.offsetWidth / logicalWidth || Infinity,
      canvasElement.offsetHeight / logicalHeight,
    );

    const needed = Math.ceil(zoom * displayScale);
    const maxByMemory = Math.floor(
      Math.sqrt(MAX_CANVAS_BUFFER_PIXELS / (logicalWidth * logicalHeight)),
    );

    return Math.max(1, Math.min(needed, maxByMemory));
  }

  function adjustCanvas(pixelScale?: number): void {
    const availableWidth =
      canvasWrapElement.clientWidth - CANVAS_VIEWPORT_PADDING_PX;
    const availableHeight =
      canvasWrapElement.clientHeight - CANVAS_VIEWPORT_PADDING_PX;

    let displayWidth: number;
    let displayHeight: number;

    if (getStore().canvasConfig.fitToContent) {
      if (pixelScale === undefined) {
        const { width, height } = _calculateFitDimensions();
        pixelScale = _getPixelScale(width, height);
      }

      const bufferWidth = canvasElement.width / pixelScale;
      const bufferHeight = canvasElement.height / pixelScale;
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

    canvasElement.style.width = toPx(Math.ceil(displayWidth));
    canvasElement.style.height = toPx(Math.ceil(displayHeight));
  }

  function redraw(options: RedrawOptions = {}): void {
    const fitToContent = getStore().canvasConfig.fitToContent;
    const { width, height } = fitToContent
      ? _calculateFitDimensions()
      : CANVAS_DEFAULTS;

    const pixelScale = options.pixelScale ?? _getPixelScale(width, height);
    _currentPixelScale = pixelScale;

    const bufferWidth = pixelScale * width;
    const bufferHeight = pixelScale * height;
    const sizeChanged =
      width !== _lastWidth ||
      height !== _lastHeight ||
      bufferWidth !== _lastBufferWidth ||
      bufferHeight !== _lastBufferHeight;

    let activeRenderOptions = options.renderOptions;
    if (sizeChanged) {
      _lastWidth = width;
      _lastHeight = height;
      _lastBufferWidth = bufferWidth;
      _lastBufferHeight = bufferHeight;

      canvasElement.width = bufferWidth;
      canvasElement.height = bufferHeight;

      ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);

      // Force full render
      if (activeRenderOptions?.range) {
        activeRenderOptions = { ...activeRenderOptions, range: undefined };
      }
    }

    render(ctx, width, height, activeRenderOptions);

    if (options.forceAdjust || (sizeChanged && fitToContent)) {
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
    const { width, height } = getStore().canvasConfig.fitToContent
      ? _calculateFitDimensions()
      : CANVAS_DEFAULTS;

    const pixelScale = _getPixelScale(width, height);
    if (pixelScale === _currentPixelScale) {
      return;
    }

    destroy();
    _redrawTimer = setTimeout(
      () => redraw({ pixelScale }),
      CANVAS_REDRAW_TIMEOUT_MS,
    );
  }

  return { redraw, scheduleRedraw, adjustCanvas, destroy };
}
