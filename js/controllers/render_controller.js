import {
    CANVAS_ASCENT_CORRECTION,
    CANVAS_FONT,
    CANVAS_FONT_REFERENCE_GLYPH,
    CANVAS_FONT_WEIGHT,
    config
} from '../common/config.js';
import {
    toPx
} from '../common/resolution_utils.js';

let _tokenizedLines = [];

export function setTokenizedLines(lines) {
    _tokenizedLines = lines;
}

export function render(ctx, width, height) {
    const fontSize = config.fontSize;
    const lineHeight = fontSize * config.lineHeight;
    const totalLines = _tokenizedLines.length;

    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${CANVAS_FONT_WEIGHT} ${toPx(fontSize)} '${CANVAS_FONT}'`;

    const textMetrics = ctx.measureText(CANVAS_FONT_REFERENCE_GLYPH);
    const ascent = textMetrics.actualBoundingBoxAscent;
    const charWidth = textMetrics.width + config.letterSpacing;

    const x0 = config.padX;
    const y0 = config.padY + ascent + Math.round(fontSize * CANVAS_ASCENT_CORRECTION);

    for (let row = 0; row < totalLines; row++) {
        let col = 0;
        const charY = y0 + row * lineHeight;

        for (const token of _tokenizedLines[row]) {
            const tokenValue = token.value;
            const tokenColor = token.getColor();
            const tokenWidth = tokenValue.length;

            if (tokenColor === null) {
                col += tokenWidth;
                continue;
            }

            ctx.fillStyle = tokenColor;
            for (let charIdx = 0; charIdx < tokenWidth; charIdx++) {
                const char = tokenValue[charIdx];
                const charX = x0 + (col + charIdx) * charWidth;

                ctx.fillText(char, charX, charY);
            }

            col += tokenWidth;
        }
    }
}