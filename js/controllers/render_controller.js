import {
    resolveTokenColor
} from '../common/color_utils.js';
import {
    ASPECT_RATIO,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    config
} from '../common/config.js';
import {
    tokenize
} from '../core/tokenizer.js';
import {
    getCanvasZoom,
    setZoomChangeCallback,
    updateZoomInfo
} from './canvas_controller.js';

let _tokenLines = [];
const _MARGIN_OFFSET = 40;
const _MAX_PIXEL_SCALE = 4;
const _QUALITY_REDRAW_DEBOUNCE_MS = 120;

let _currentPixelScale = 1;
let _qualityRedrawTimer = null;

const editorElement = document.getElementById('ed');
const canvasElement = document.getElementById('canvas');
const canvasWrapElement = document.getElementById('canvas-wrap');

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

            if (tokenColor === null) {
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

function _computePixelScale(canvasZoom) {
    const deviceAwareZoom = canvasZoom * window.devicePixelRatio;
    return Math.min(_MAX_PIXEL_SCALE, Math.max(1, Math.ceil(deviceAwareZoom)));
}

function _renderAtScale(pixelScale) {
    _currentPixelScale = pixelScale;

    const ctx = canvasElement.getContext('2d');

    canvasElement.width = CANVAS_WIDTH * pixelScale;
    canvasElement.height = CANVAS_HEIGHT * pixelScale;

    ctx.scale(pixelScale, pixelScale);
    render(ctx, _tokenLines, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function _scheduleQualityRedraw(canvasZoom) {
    const neededPixelScale = _computePixelScale(canvasZoom);
    if (neededPixelScale === _currentPixelScale) {
        return;
    }

    clearTimeout(_qualityRedrawTimer);
    _qualityRedrawTimer = setTimeout(() => {
        _renderAtScale(_computePixelScale(getCanvasZoom()));
    }, _QUALITY_REDRAW_DEBOUNCE_MS);
}

function redraw() {
    _tokenLines = tokenize(editorElement.value);

    const pixelScale = _computePixelScale(getCanvasZoom());
    _renderAtScale(pixelScale);

    canvasElement.style.width = _getNormalizedDimension(CANVAS_WIDTH);
    canvasElement.style.height = _getNormalizedDimension(CANVAS_HEIGHT);

    const availableWidth = canvasWrapElement.clientWidth - _MARGIN_OFFSET;
    const availableHeight = canvasWrapElement.clientHeight - _MARGIN_OFFSET;

    let displayWidth = Math.min(availableWidth, availableHeight * ASPECT_RATIO);
    let displayHeight = displayWidth / ASPECT_RATIO;

    if (displayHeight > availableHeight) {
        displayHeight = availableHeight;
        displayWidth = displayHeight * ASPECT_RATIO;
    }

    canvasElement.style.width = _getNormalizedDimension(displayWidth);
    canvasElement.style.height = _getNormalizedDimension(displayHeight);

    updateZoomInfo();
}

setZoomChangeCallback(_scheduleQualityRedraw);

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