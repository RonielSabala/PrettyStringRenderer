import {
    updateZoomInfo
} from "./canvas_controller.js";
import {
    resolveColor
} from "./color_utils.js";
import {
    ASPECT_RATIO,
    config,
    OUT_HEIGHT,
    OUT_WIDTH
} from "./config.js";
import {
    tokenize
} from "./tokenizer.js";
let tokenLines = [];

function _getFont(fontSize) {
    return `400 ${fontSize}px 'Cascadia Code', 'Courier New', monospace`;
}

function render(context, lines, W, H) {
    context.fillStyle = config.colors.background;
    context.fillRect(0, 0, W, H);
    context.font = _getFont(config.fontSize);
    context.textBaseline = 'alphabetic';

    const cw = context.measureText('M').width + config.letterSpacing;
    const lhpx = config.fontSize * config.lineHeight;
    const x0 = config.canvasPadX;
    const y0 = config.canvasPadY + config.fontSize * 0.82;

    for (let row = 0; row < lines.length; row++) {
        let col = 0;
        const cy = y0 + row * lhpx;
        for (const token of lines[row]) {
            const tokenColor = resolveColor(token);
            if (!tokenColor) {
                col += token.v.length;
                continue;
            }

            context.fillStyle = tokenColor;
            for (let c = 0; c < token.v.length; c++) {
                context.fillText(token.v[c], x0 + (col + c) * cw, cy);
            }

            col += token.v.length;
        }
    }
}

function redraw() {
    tokenLines = tokenize(document.getElementById('ed').value);

    const canvas = document.getElementById('canvas');
    const wrap = document.getElementById('cv-wrap');

    // Canvas always at full output resolution
    canvas.width = OUT_WIDTH;
    canvas.height = OUT_HEIGHT;

    render(canvas.getContext('2d'), tokenLines, OUT_WIDTH, OUT_HEIGHT);

    // CSS display size fits wrap, preserving aspect ratio
    const wW = wrap.clientWidth - 40;
    const wH = wrap.clientHeight - 40;
    let dW = Math.min(wW, wH * ASPECT_RATIO);
    let dH = dW / ASPECT_RATIO;
    if (dH > wH) {
        dH = wH;
        dW = dH * ASPECT_RATIO;
    }
    canvas.style.width = Math.max(1, Math.round(dW)) + 'px';
    canvas.style.height = Math.max(1, Math.round(dH)) + 'px';

    updateZoomInfo();
}

export {
    redraw,
    render,
    tokenLines
};