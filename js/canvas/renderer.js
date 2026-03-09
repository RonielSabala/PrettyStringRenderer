import {
    APP_FONT_VARIANT_LIGATURES,
    CANVAS_ASCENT_CORRECTION,
    CANVAS_CONTEXT_TYPE,
    CANVAS_FONT,
    CANVAS_FONT_REFERENCE_GLYPH,
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

const _measureCtx = document.createElement('canvas').getContext(CANVAS_CONTEXT_TYPE);

function _getTextMetrics() {
    return _measureCtx.measureText(CANVAS_FONT_REFERENCE_GLYPH);
}

function _setupContextFont(ctx, config) {
    ctx.font = `${CANVAS_FONT_WEIGHT} ${toPx(config.fontSize)} '${CANVAS_FONT}'`;
    ctx.letterSpacing = toPx(config.letterSpacing);
    ctx.textRendering = config.textRendering;
}

export function iterateTokens(width, height, config, onToken) {
    const fontSize = config.fontSize;
    const lineHeight = fontSize * config.lineHeight;
    const tokenizedLines = state.tokenizer.tokenizedLines;

    _setupContextFont(_measureCtx, config);
    const metrics = _getTextMetrics();
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
        const charY = y0 + row * lineHeight;

        for (const token of tokenizedLines[row]) {
            const startCol = col;
            const tokenValue = token.value;
            const tokenColor = token.color;

            col += tokenValue.length;
            if (tokenColor === null) {
                continue;
            }

            const charX = padX + startCol * charWidth;
            if (charX >= width) {
                break;
            }

            onToken(tokenValue, tokenColor, charX, charY, charWidth);
        }
    }
}

export function render(ctx, width, height, configOverride = null) {
    const config = configOverride ?? state.typographyConfig;
    const padX = config.padX;
    const padY = config.padY;
    const optimizeRender = config.textRendering === CSS_TEXT_RENDERING.OPTIMIZE_SPEED;

    // Draw background
    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, width, height);

    // Define clipping region
    ctx.save();
    ctx.beginPath();
    ctx.rect(padX, padY, width - padX, height - padY);
    ctx.clip();

    // Draw tokens
    _setupContextFont(ctx, config);
    iterateTokens(width, height, config, (text, color, x, y, charWidth) => {
        ctx.fillStyle = color;
        if (optimizeRender) {
            x = Math.floor(x);
            y = Math.floor(y);
        }

        // Show ligatures
        if (APP_FONT_VARIANT_LIGATURES !== CSS_FONT_VARIANT_LIGATURES.NONE) {
            ctx.fillText(text, x, y);
            return;
        }

        // Draw char-by-char to prevent ligature substitution
        for (let i = 0; i < text.length; i++) {
            ctx.fillText(text[i], x + i * charWidth, y);
        }
    });

    ctx.restore();
}