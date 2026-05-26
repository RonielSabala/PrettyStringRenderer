import { CANVAS_DEFAULTS } from "../common/config";
import { CSS_TEXT_RENDERING } from "../common/constants/css";
import { getStore } from "../common/store";
import {
  TOKENS,
  type ThemeColor,
  type TypographyConfig,
} from "../common/types";
import { Tokenizer } from "../core/tokenizer";
import { toPx } from "../utils/resolution";

const _CONTEXT_TYPE = "2d";
const _FONT_REFERENCE_GLYPH = "M";

// Module-level measurement cache
let _lastFontSize = 0;
let _lastLetterSpacing = 0;
let _lastTextRendering = "";
let _lastMeasuredLine: string | null = null;

let _ascentMetric: number | null = null;
export let charWidthMetric: number | null = null;

const _measureCtx = getDrawingContext(document.createElement("canvas"));

export function getDrawingContext(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D {
  return canvas.getContext(_CONTEXT_TYPE, { alpha: true })!;
}

function _setupContextFont(
  ctx: CanvasRenderingContext2D,
  config: TypographyConfig,
): void {
  ctx.font = `${CANVAS_DEFAULTS.fontWeight} ${toPx(config.fontSize)} '${CANVAS_DEFAULTS.font}'`;
  ctx.letterSpacing = toPx(config.letterSpacing);
  ctx.textRendering = config.textRendering;
}

export function updateTextMetrics(
  config: TypographyConfig,
  tokenizer: Tokenizer,
): void {
  const { fontSize, letterSpacing, textRendering } = config;
  const metricsChanged =
    fontSize !== _lastFontSize ||
    letterSpacing !== _lastLetterSpacing ||
    textRendering !== _lastTextRendering;

  if (metricsChanged) {
    _lastFontSize = fontSize;
    _lastLetterSpacing = letterSpacing;
    _lastTextRendering = textRendering;

    _setupContextFont(_measureCtx, config);
    charWidthMetric = _measureCtx.measureText(_FONT_REFERENCE_GLYPH).width;
  }

  // Measure ascent
  const firstLine = tokenizer.lines[0] || _FONT_REFERENCE_GLYPH;
  if (metricsChanged || _lastMeasuredLine !== firstLine) {
    _lastMeasuredLine = firstLine;
    _ascentMetric = _measureCtx.measureText(firstLine).actualBoundingBoxAscent;
  }
}

export interface RenderRange {
  minCol: number;
  minRow: number;
  maxCol: number;
  maxRow: number;
}

export function iterateTokens(
  width: number,
  height: number,
  config: TypographyConfig,
  onToken: (text: string, color: ThemeColor, x: number, y: number) => void,
  range?: RenderRange,
): void {
  const tokenizer = getStore().tokenizer;
  updateTextMetrics(config, tokenizer);

  const padX = config.padX;
  const padY = config.padY + _ascentMetric!;
  const charWidth = charWidthMetric!;
  const lineHeight = config.fontSize * config.lineHeight;

  // Calculate visible bounds
  const highestCol = Math.min(
    tokenizer.longestLine - 1,
    Math.ceil((width - padX) / charWidth),
  );
  const highestRow = Math.min(
    tokenizer.linesCount - 1,
    Math.ceil((height - padY) / lineHeight) + 1,
  );

  if (highestCol < 0 || highestRow < 0) {
    return;
  }

  // Parse range
  const maxCol = Math.max(0, Math.min(range?.maxCol ?? highestCol, highestCol));
  const maxRow = Math.max(0, Math.min(range?.maxRow ?? highestRow, highestRow));
  const minCol = Math.min(maxCol, Math.max(0, range?.minCol ?? 0));
  const minRow = Math.min(maxRow, Math.max(0, range?.minRow ?? 0));

  const lines = tokenizer.tokenizedLines;
  for (let row = minRow; row <= maxRow; row++) {
    const y = padY + row * lineHeight;

    let col = 0;
    for (const token of lines[row]) {
      const currentCol = col;
      const tokenValue = token.value;

      col += tokenValue.length;
      if (col <= minCol) {
        continue;
      }

      const isOutOfBound = col > maxCol + 1;
      if (token.type !== TOKENS.BACKGROUND) {
        const x = padX + currentCol * charWidth;
        const tokenText = isOutOfBound
          ? tokenValue.substring(0, maxCol - currentCol + 1)
          : tokenValue;

        onToken(tokenText, token.color, x, y);
      }

      if (isOutOfBound) {
        break;
      }
    }
  }
}

export interface RenderOptions {
  range?: RenderRange;
  configOverride?: TypographyConfig;
}

export function render(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: RenderOptions = {},
): void {
  const { typographyConfig, colors } = getStore();

  const config = options.configOverride ?? typographyConfig;
  const { fontSize, letterSpacing } = config;

  const isSpeedOptimized =
    config.textRendering === CSS_TEXT_RENDERING.OPTIMIZE_SPEED;

  const backgroundColor = colors.background;
  const isBackgroundRemoved = !backgroundColor;

  const setBackground = (x1: number, y1: number, x2: number, y2: number) => {
    if (isBackgroundRemoved) {
      ctx.clearRect(x1, y1, x2, y2);
      return;
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x1, y1, x2, y2);
  };

  setBackground(0, 0, width, height);
  _setupContextFont(ctx, config);
  iterateTokens(
    width,
    height,
    config,
    (text, color, x, y) => {
      if (!color) {
        if (!backgroundColor) {
          // Clear text
          setBackground(
            x,
            y - fontSize,
            ctx.measureText(text).width + letterSpacing,
            fontSize,
          );
        }

        return;
      }

      ctx.fillStyle = color;
      ctx.fillText(
        text,
        isSpeedOptimized ? x | 0 : x,
        isSpeedOptimized ? y | 0 : y,
      );
    },
    options.range,
  );
}
