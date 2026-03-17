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

let _lastConfigStr = '';
let _lastMeasuredLine = null;

export const textMetrics = {
    charWidth: null,
    fontAscent: null,
}

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

export function updateTextMetrics(config) {
    const {
        fontSize,
        letterSpacing,
        textRendering
    } = config;

    const configStr = `${fontSize}-${letterSpacing}-${textRendering}`;
    const metricsChanged = configStr !== _lastConfigStr;

    if (metricsChanged) {
        _lastConfigStr = configStr;
        _setupContextFont(_measureCtx, config);
        textMetrics.charWidth = _measureCtx.measureText(_FONT_REFERENCE_GLYPH).width;
    }

    const firstLine = tokenizer.lines[0] || _FONT_REFERENCE_GLYPH;

    if (metricsChanged || _lastMeasuredLine !== firstLine) {
        _lastMeasuredLine = firstLine;
        textMetrics.fontAscent = _measureCtx.measureText(firstLine).actualBoundingBoxAscent;
    }
}

export function iterateTokens(width, height, config, onToken) {
    updateTextMetrics(config)

    const padX = config.padX;
    const padY = config.padY + textMetrics.fontAscent;
    const charWidth = textMetrics.charWidth;
    const lineHeight = config.fontSize * config.lineHeight;

    // Calculate visible bounds
    const maxCol = Math.ceil((width - padX) / charWidth);
    const maxRow = Math.min(
        Math.ceil((height - padY) / lineHeight) + 1,
        tokenizer.linesCount - 1
    );

    if (maxRow < 0 || maxCol < 0) return;

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
            const text = col > maxCol ? tokenValue.substring(0, maxCol - startCol) : tokenValue;
            onToken(text, tokenColor, x, y);

            if (col > maxCol) {
                break;
            }
        }
    }
}

export function render(ctx, width, height, configOverride = null) {
    const config = configOverride ?? state.typographyConfig;
    const isOptimizeSpeed = config.textRendering === CSS_TEXT_RENDERING.OPTIMIZE_SPEED;

    // Background
    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, width, height);

    _setupContextFont(ctx, config);

    iterateTokens(width, height, config, (text, color, x, y) => {
        ctx.fillStyle = color;
        if (isOptimizeSpeed) {
            ctx.fillText(text, x | 0, y | 0);
        } else {
            ctx.fillText(text, x, y);
        }
    });
}