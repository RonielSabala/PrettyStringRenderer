import {
    CANVAS_ASCENT_CORRECTION,
    CANVAS_CONTEXT_TYPE,
    CANVAS_FONT,
    CANVAS_FONT_REFERENCE_GLYPH,
    CANVAS_FONT_WEIGHT
} from '../common/config.js';
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

function _setupContextFont(ctx, fontSize, letterSpacing) {
    ctx.font = `${CANVAS_FONT_WEIGHT} ${toPx(fontSize)} '${CANVAS_FONT}'`;
    ctx.letterSpacing = toPx(letterSpacing);
}

export function iterateTokens(width, height, config, onToken) {
    const padX = config.padX;
    const padY = config.padY;
    const fontSize = config.fontSize;
    const lineHeight = fontSize * config.lineHeight;
    const tokenizedLines = state.tokenizer.tokenizedLines;

    _setupContextFont(_measureCtx, fontSize, config.letterSpacing);
    const metrics = _getTextMetrics();
    const charWidth = metrics.width;
    const ascent = metrics.actualBoundingBoxAscent;
    const y0 = padY + ascent + Math.round(fontSize * CANVAS_ASCENT_CORRECTION);

    // Pre-compute last row
    const lastRow = Math.min(
        Math.ceil((height - y0) / lineHeight) + 1,
        tokenizedLines.length - 1
    );

    if (lastRow < 0) {
        return;
    }

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

            onToken(tokenValue, tokenColor, charX, charY);
        }
    }
}

export function render(ctx, width, height, configOverride = null) {
    const config = configOverride ?? state.typographyConfig;
    const padX = config.padX;
    const padY = config.padY;

    // Draw background
    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, width, height);

    // Define clipping region
    ctx.save();
    ctx.beginPath();
    ctx.rect(padX, padY, width - padX, height - padY);
    ctx.clip();

    // Draw tokens
    _setupContextFont(ctx, config.fontSize, config.letterSpacing);
    iterateTokens(width, height, config, (text, color, x, y) => {
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    });

    ctx.restore();
}