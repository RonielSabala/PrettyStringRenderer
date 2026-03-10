import {
    CANVAS_ASCENT_CORRECTION,
    CANVAS_FONT,
    CANVAS_FONT_WEIGHT
} from '../common/config.js';
import {
    CSS_TEXT_RENDERING
} from '../common/constants/css.js';
import {
    state
} from '../common/store.js';
import {
    toPx
} from '../utils/resolution.js';

const _CONTEXT_TYPE = '2d';
const _FONT_REFERENCE_GLYPH = 'M';

// Private helpers

function _setupContextFont(ctx, config) {
    ctx.font = `${CANVAS_FONT_WEIGHT} ${toPx(config.fontSize)} '${CANVAS_FONT}'`;
    ctx.letterSpacing = toPx(config.letterSpacing);
    ctx.textRendering = config.textRendering;
}

// Public helpers

export function getDrawingContext(HTMLCanvasElement) {
    return HTMLCanvasElement.getContext(_CONTEXT_TYPE, {
        alpha: false
    });
}

const _measureCtx = (window.__MEASURE_CTX ??= getDrawingContext(document.createElement('canvas')));

export function iterateTokens(width, height, config, onToken) {
    const fontSize = config.fontSize;
    const lineHeight = fontSize * config.lineHeight;
    const tokenizedLines = state.tokenizer.tokenizedLines;

    _setupContextFont(_measureCtx, config);
    const metrics = _measureCtx.measureText(_FONT_REFERENCE_GLYPH);
    const charWidth = metrics.width;
    const ascent = metrics.actualBoundingBoxAscent;

    const padX = config.padX;
    const padY = config.padY + ascent + Math.round(fontSize * CANVAS_ASCENT_CORRECTION);

    const maxCol = Math.ceil((width - padX) / charWidth);
    const maxRow = Math.min(
        Math.ceil((height - padY) / lineHeight) + 1,
        tokenizedLines.length - 1
    );

    if (maxRow < 0 || maxCol < 0) {
        return;
    }

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
            const maxColExceeded = col > maxCol;
            const visibleText = maxColExceeded ? tokenValue.substring(0, maxCol - startCol) : tokenValue;
            onToken(visibleText, tokenColor, x, y);

            if (maxColExceeded) {
                break;
            }
        }
    }
}

// Render function

export function render(ctx, width, height, configOverride = null) {
    const config = configOverride ?? state.typographyConfig;
    const optimizeRender = config.textRendering === CSS_TEXT_RENDERING.OPTIMIZE_SPEED;

    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, width, height);

    _setupContextFont(ctx, config);
    iterateTokens(width, height, config, (text, color, x, y) => {
        ctx.fillStyle = color;
        ctx.fillText(
            text,
            optimizeRender ? Math.floor(x) : x,
            optimizeRender ? Math.floor(y) : y
        );
    });
}