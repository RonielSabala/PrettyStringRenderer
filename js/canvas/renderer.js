import {
    APP_FONT_VARIANT_LIGATURES,
    CANVAS_ASCENT_CORRECTION,
    CANVAS_FONT,
    CANVAS_FONT_WEIGHT
} from '../common/config.js';
import {
    CSS_FONT_VARIANT_LIGATURES,
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

export function getDrawingContext(canvasElement) {
    return canvasElement.getContext(_CONTEXT_TYPE, {
        alpha: false
    });
}

export function iterateTokens(width, height, config) {
    const batch = new Map();
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
        return batch;
    }

    const padX = config.padX;
    for (let row = 0; row <= lastRow; row++) {
        let col = 0;
        const y = y0 + row * lineHeight;

        for (const token of tokenizedLines[row]) {
            const startCol = col;
            const text = token.value;
            const tokenColor = token.color;

            col += text.length;
            if (tokenColor === null) {
                continue;
            }

            const x = padX + startCol * charWidth;
            if (x >= width) {
                break;
            }

            if (!batch.has(tokenColor)) {
                batch.set(tokenColor, []);
            }

            batch.get(tokenColor).push({
                text,
                x,
                y,
                charWidth
            });

        }
    }

    return batch;
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
    const batch = iterateTokens(width, height, config);

    for (const [color, calls] of batch) {
        ctx.fillStyle = color;
        for (const {
                text,
                x,
                y,
                charWidth
            }
            of calls) {
            const fx = optimizeRender ? Math.floor(x) : x;
            const fy = optimizeRender ? Math.floor(y) : y;

            // Show ligatures
            if (APP_FONT_VARIANT_LIGATURES !== CSS_FONT_VARIANT_LIGATURES.NONE) {
                ctx.fillText(text, fx, fy);
                continue;
            }

            // Draw char-by-char to prevent ligature substitution
            for (let i = 0; i < text.length; i++) {
                ctx.fillText(text[i], fx + i * charWidth, fy);
            }
        }
    }

    ctx.restore();
}