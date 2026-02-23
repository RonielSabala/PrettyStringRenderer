import {
    resolveTokenColor
} from '../common/color_utils.js';
import {
    ASPECT_RATIO,
    config,
    OUT_HEIGHT,
    OUT_WIDTH
} from '../common/config.js';
import {
    tokenize
} from '../core/tokenizer.js';
import {
    updateZoomInfo
} from './canvas_controller.js';

let _tokenLines = [];
const _MARGIN_OFFSET = 40;

function getTokenLines() {
    return _tokenLines;
}

// Renderer

function _getFont(size) {
    return `400 ${size}px 'Cascadia Code'`;
}

function render(ctx, lines, width, height) {
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);

    ctx.font = _getFont(config.fontSize);
    ctx.textBaseline = 'alphabetic';

    const charWidth = ctx.measureText('M').width + config.letterSpacing;
    const lineHeight = config.fontSize * config.lineHeight;

    const x0 = config.padX;
    const y0 = config.padY + config.fontSize * 0.82;

    for (let row = 0; row < lines.length; row++) {
        let col = 0;
        const cy = y0 + row * lineHeight;

        for (const token of lines[row]) {
            const tokenValue = token.value;
            const tokenWidth = tokenValue.length;
            const tokenColor = resolveTokenColor(token);

            if (!tokenColor) {
                col += tokenWidth;
                continue;
            }

            ctx.fillStyle = tokenColor;
            for (let charCount = 0; charCount < tokenWidth; charCount++) {
                const char = tokenValue[charCount];
                const cx = x0 + (col + charCount) * charWidth;

                ctx.fillText(char, cx, cy);
            }

            col += tokenWidth;
        }
    }
}

function _getNormalizedDimension(dimension) {
    return Math.max(1, Math.round(dimension)) + 'px';
}

function redraw() {
    _tokenLines = tokenize(document.getElementById('ed').value);

    const canvas = document.getElementById('canvas');
    const wrap = document.getElementById('canvas-wrap');

    canvas.width = OUT_WIDTH;
    canvas.height = OUT_HEIGHT;

    render(canvas.getContext('2d'), _tokenLines, OUT_WIDTH, OUT_HEIGHT);

    // Scale canvas CSS size to fit the viewport while preserving aspect ratio

    const availableWidth = wrap.clientWidth - _MARGIN_OFFSET;
    const availableHeight = wrap.clientHeight - _MARGIN_OFFSET;

    let displayWidth = Math.min(availableWidth, availableHeight * ASPECT_RATIO);
    let displayHeight = displayWidth / ASPECT_RATIO;

    if (displayHeight > availableHeight) {
        displayHeight = availableHeight;
        displayWidth = displayHeight * ASPECT_RATIO;
    }

    canvas.style.width = _getNormalizedDimension(displayWidth);
    canvas.style.height = _getNormalizedDimension(displayHeight);
    updateZoomInfo();
}

// Color controls

function updateColor(key, value) {
    const fill = document.getElementById(`sf-${key}`);
    const pick = document.getElementById(`cp-${key}`);
    const hex = document.getElementById(`hx-${key}`);

    if (fill) {
        fill.style.background = value;
    }

    if (pick) {
        pick.value = value;
    }

    if (hex) {
        hex.value = value;
    }
}

function setColor(key, value) {
    config.colors[key] = value;
    updateColor(key, value);
    redraw();
}

export {
    getTokenLines,
    redraw,
    render,
    setColor,
    updateColor
};