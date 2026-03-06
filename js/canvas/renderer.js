import {
    CANVAS_ASCENT_CORRECTION,
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

export function render(ctx, width, height) {
    const config = state.typographyConfig;
    const tokenizedLines = state.tokenizer.tokenizedLines;

    const padX = config.padX;
    const padY = config.padY;
    const fontSize = config.fontSize;
    const lineHeight = fontSize * config.lineHeight;

    // Setup font
    ctx.font = `${CANVAS_FONT_WEIGHT} ${toPx(fontSize)} '${CANVAS_FONT}'`;
    ctx.letterSpacing = toPx(config.letterSpacing);

    const textMetrics = ctx.measureText(CANVAS_FONT_REFERENCE_GLYPH);
    const charWidth = textMetrics.width;
    const ascent = textMetrics.actualBoundingBoxAscent;
    const y0 = padY + ascent + Math.round(fontSize * CANVAS_ASCENT_CORRECTION);

    // Draw background
    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, width, height);

    // Pre-compute last row
    const lastRow = Math.min(
        Math.ceil((height - y0) / lineHeight) + 1,
        tokenizedLines.length - 1
    );

    if (lastRow < 0) {
        return;
    }

    // Define clipping region
    ctx.save();
    ctx.beginPath();
    ctx.rect(padX, padY, width - padX, height - padY);
    ctx.clip();

    for (let row = 0; row <= lastRow; row++) {
        let col = 0;
        const charY = y0 + row * lineHeight;

        for (const token of tokenizedLines[row]) {
            const prevCol = col;
            col += token.value.length;
            if (token.color === null) {
                continue;
            }

            const charX = padX + prevCol * charWidth;
            if (charX >= width) {
                break;
            }

            ctx.fillStyle = token.color;
            ctx.fillText(token.value, charX, charY);
        }
    }

    ctx.restore();
}