import { CANVAS_DEFAULTS } from "../common/config";
import { CSS_TEXT_RENDERING } from "../common/constants/css";
import { getStore } from "../common/store";
import {
  TOKENS,
  type ThemeColor,
  type TypographyConfig,
} from "../common/types";
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

export function updateTextMetrics(config: TypographyConfig): void {
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

  const tokenizer = getStore().tokenizer;
  const firstLine = tokenizer.lines[0] || _FONT_REFERENCE_GLYPH;

  // Measure ascent
  if (metricsChanged || _lastMeasuredLine !== firstLine) {
    _lastMeasuredLine = firstLine;
    _ascentMetric = _measureCtx.measureText(firstLine).actualBoundingBoxAscent;
  }
}

export function iterateTokens(
  width: number,
  height: number,
  config: TypographyConfig,
  onToken: (text: string, color: ThemeColor, x: number, y: number) => void,
): void {
  updateTextMetrics(config);
  const tokenizer = getStore().tokenizer;

  const padX = config.padX;
  const padY = config.padY + _ascentMetric!;
  const charWidth = charWidthMetric!;
  const lineHeight = config.fontSize * config.lineHeight;

  // Calculate visible bounds
  const maxCol = Math.ceil((width - padX) / charWidth);
  const maxRow = Math.min(
    Math.ceil((height - padY) / lineHeight) + 1,
    tokenizer.linesCount - 1,
  );

  if (maxRow < 0 || maxCol < 0) {
    return;
  }

  const lines = tokenizer.tokenizedLines;
  for (let row = 0; row <= maxRow; row++) {
    let col = 0;
    const y = padY + row * lineHeight;

    for (const token of lines[row]) {
      const startCol = col;
      const tokenValue = token.value;

      col += tokenValue.length;
      if (token.type === TOKENS.BACKGROUND) {
        continue;
      }

      const x = padX + startCol * charWidth;
      const tokenText =
        col > maxCol ? tokenValue.substring(0, maxCol - startCol) : tokenValue;

      onToken(tokenText, token.color, x, y);

      if (col > maxCol) {
        break;
      }
    }
  }
}

export function render(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  configOverride?: TypographyConfig,
): void {
  const { typographyConfig, colors } = getStore();
  const config = configOverride ?? typographyConfig;
  const { fontSize, letterSpacing } = config;

  const isSpeedOptimized =
    config.textRendering === CSS_TEXT_RENDERING.OPTIMIZE_SPEED;

  // Background
  const backgroundColor = colors.background;
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  _setupContextFont(ctx, config);
  iterateTokens(width, height, config, (text, color, x, y) => {
    // Clear text
    if (!color) {
      if (!backgroundColor) {
        ctx.clearRect(
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
  });
}
