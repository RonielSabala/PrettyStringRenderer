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
const _measureCtx = getDrawingContext(document.createElement('canvas'));

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

export function iterateTokens(width, height, config, onToken) {
    const fontSize = config.fontSize;
    const lineHeight = fontSize * config.lineHeight;
    const tokenizedLines = state.tokenizer.tokenizedLines;

    _setupContextFont(_measureCtx, config);
    const metrics = _measureCtx.measureText(_FONT_REFERENCE_GLYPH);
    const charWidth = metrics.width;
    const ascent = metrics.actualBoundingBoxAscent;
    const y0 = config.padY + ascent + Math.round(fontSize * CANVAS_ASCENT_CORRECTION);

    // Pre-compute last row
    const lastRow = Math.min(
        Math.ceil((height - y0) / lineHeight) + 1,
        tokenizedLines.length - 1
    );

    if (lastRow < 0) {
        return;
    }

    const padX = config.padX;
    for (let row = 0; row <= lastRow; row++) {
        let col = 0;
        const y = y0 + row * lineHeight;

        for (const token of tokenizedLines[row]) {
            const startCol = col;
            const tokenValue = token.value;
            const tokenColor = token.color;

            col += tokenValue.length;
            if (tokenColor === null) {
                continue;
            }

            const x = padX + startCol * charWidth;
            if (x >= width) {
                break;
            }

            onToken(tokenValue, tokenColor, x, y);
        }
    }
}

// Render function

export function render(ctx, width, height, configOverride = null) {
    const config = configOverride ?? state.typographyConfig;
    const optimizeRender = config.textRendering === CSS_TEXT_RENDERING.OPTIMIZE_SPEED;

    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.beginPath();
    ctx.rect(config.padX, config.padY, width - config.padX, height - config.padY);
    ctx.clip();

    _setupContextFont(ctx, config);
    iterateTokens(width, height, config, (text, color, x, y) => {
        ctx.fillStyle = color;
        ctx.fillText(
            text,
            optimizeRender ? Math.floor(x) : x,
            optimizeRender ? Math.floor(y) : y
        );
    });

    ctx.restore();
}