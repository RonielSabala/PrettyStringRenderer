import {
    CANVAS_DEFAULTS
} from '../common/config.js';
import {
    CSS_TEXT_RENDERING
} from '../common/constants/css.js';
import {
    state,
    tokenizer
} from '../common/store.js';
import {
    toPx
} from '../utils/resolution.js';

const _CONTEXT_TYPE = '2d';
const _FONT_REFERENCE_GLYPH = 'M';

let _lastFontSize = 0;
let _lastLetterSpacing = 0;
let _lastTextRendering = '';
let _lastMeasuredLine = null;

let _ascentMetric = null;
export let charWidthMetric = null;

export function getDrawingContext(HTMLCanvasElement) {
    return HTMLCanvasElement.getContext(_CONTEXT_TYPE, {
        alpha: false
    });
}

const _measureCtx = (window.__MEASURE_CTX ??= getDrawingContext(document.createElement('canvas')));

function _setupContextFont(ctx, config) {
    ctx.font = `${CANVAS_DEFAULTS.fontWeight} ${toPx(config.fontSize)} '${CANVAS_DEFAULTS.font}'`;
    ctx.letterSpacing = toPx(config.letterSpacing);
    ctx.textRendering = config.textRendering;
}

export function updateTextMetrics(config, maxWidth = null) {
    const {
        fontSize,
        letterSpacing,
        textRendering
    } = config;

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

    let firstLine = tokenizer.lines[0] || _FONT_REFERENCE_GLYPH;

    // Optimize first line
    if (maxWidth !== null && firstLine !== _FONT_REFERENCE_GLYPH) {
        const maxChars = Math.ceil(maxWidth / charWidthMetric);

        if (firstLine.length > maxChars) {
            firstLine = firstLine.slice(0, maxChars);
        }
    }

    // Measure ascent
    if (metricsChanged || _lastMeasuredLine !== firstLine) {
        _lastMeasuredLine = firstLine;
        _ascentMetric = _measureCtx.measureText(firstLine).actualBoundingBoxAscent;
    }
}

export function iterateTokens(width, height, config, onToken) {
    const padX = config.padX;
    const maxWidth = width - padX;
    updateTextMetrics(config, maxWidth)

    const padY = config.padY + _ascentMetric;
    const charWidth = charWidthMetric;
    const lineHeight = config.fontSize * config.lineHeight;

    // Calculate visible bounds
    const maxCol = Math.ceil(maxWidth / charWidth);
    const maxRow = Math.min(
        Math.ceil((height - padY) / lineHeight) + 1,
        tokenizer.linesCount - 1
    );

    if (maxRow < 0 || maxCol < 0) {
        return;
    }

    const tokenizedLines = tokenizer.tokenizedLines;
    for (let row = 0; row <= maxRow; row++) {
        let col = 0;
        const y = padY + row * lineHeight;

        for (const token of tokenizedLines[row]) {
            const startCol = col;
            const tokenValue = token.value;
            const tokenColor = token.color;

            col += tokenValue.length;
            if (tokenColor === null) {
                continue;
            }

            const x = padX + startCol * charWidth;
            const tokenText = col > maxCol ? tokenValue.substring(0, maxCol - startCol) : tokenValue;
            onToken(tokenText, tokenColor, x, y);

            if (col > maxCol) {
                break;
            }
        }
    }
}

export function render(ctx, width, height, configOverride = null) {
    const config = configOverride ?? state.typographyConfig;
    const isSpeedOptimized = config.textRendering === CSS_TEXT_RENDERING.OPTIMIZE_SPEED;

    // Background
    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, width, height);

    _setupContextFont(ctx, config);

    iterateTokens(width, height, config, (text, color, x, y) => {
        ctx.fillStyle = color;
        ctx.fillText(
            text,
            isSpeedOptimized ? x | 0 : x,
            isSpeedOptimized ? y | 0 : y
        );
    });
}
