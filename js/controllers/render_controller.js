import {
    CANVAS_ASCENT_CORRECTION,
    CANVAS_FONT,
    CANVAS_FONT_REFERENCE_GLYPH,
    CANVAS_FONT_WEIGHT
} from '../common/config.js';
import {
    toPx
} from '../common/resolution_utils.js';
import {
    state
} from '../common/store.js';

export function render(ctx, width, height) {
    const config = state.config;
    const fontSize = config.fontSize;
    const lineHeight = fontSize * config.lineHeight;
    const letterSpacing = config.letterSpacing;
    const tokenizedLines = state.tokenizer.tokenizedLines;
    const totalLines = tokenizedLines.length;

    ctx.font = `${CANVAS_FONT_WEIGHT} ${toPx(fontSize)} '${CANVAS_FONT}'`;
    ctx.letterSpacing = toPx(letterSpacing);
    ctx.fillStyle = state.colors.background;
    ctx.fillRect(0, 0, width, height);

    const textMetrics = ctx.measureText(CANVAS_FONT_REFERENCE_GLYPH);
    const ascent = textMetrics.actualBoundingBoxAscent;
    const charWidth = textMetrics.width + letterSpacing;

    const x0 = config.padX;
    const y0 = config.padY + ascent + Math.round(fontSize * CANVAS_ASCENT_CORRECTION);

    for (let row = 0; row < totalLines; row++) {
        let col = 0;
        const charY = y0 + row * lineHeight;

        for (const token of tokenizedLines[row]) {
            const tokenValue = token.value;
            const tokenColor = token.getColor();

            if (tokenColor !== null) {
                ctx.fillStyle = tokenColor;
                ctx.fillText(tokenValue, x0 + col * charWidth, charY);
            }

            col += tokenValue.length;
        }
    }
}