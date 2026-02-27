import {
    CANVAS_ASCENT_FACTOR,
    CANVAS_AVAILABLE_MARGIN_OFFSET_PX,
    CANVAS_DEFAULTS,
    CANVAS_MAX_PIXEL_SCALE,
    CANVAS_MIN_PIXEL_SCALE,
    CANVAS_QUALITY_REDRAW_DEBOUNCE_MS,
    config
} from '../common/config.js';
import {
    canvasElement,
    canvasWrapElement,
    getColorPickerElement,
    getHexInputElement,
    getSwatchFillElement
} from '../common/elements.js';

import {
    getCanvasZoom,
    setZoomChangeCallback,
    updateZoomInfo
} from './canvas_controller.js';

let _tokenizedLines = [];

let _currentPixelScale = 1;
let _qualityRedrawTimer = null;

function setTokenizedLines(lines) {
    _tokenizedLines = lines;
}

// Renderer

function _getFont(size) {
    return `400 ${size}px 'Cascadia Code'`;
}

function render(ctx, width, height) {
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);

    const fontSize = config.fontSize;
    ctx.font = _getFont(fontSize);

    const ascent = ctx.measureText('M').actualBoundingBoxAscent;
    const charWidth = ctx.measureText('M').width + config.letterSpacing;
    const lineHeight = fontSize * config.lineHeight;

    const x0 = config.padX;
    const y0 = config.padY + ascent + Math.round(fontSize * CANVAS_ASCENT_FACTOR);

    const totalLines = _tokenizedLines.length;
    for (let row = 0; row < totalLines; row++) {
        let col = 0;
        const charY = y0 + row * lineHeight;

        for (const token of _tokenizedLines[row]) {
            const tokenValue = token.value;
            const tokenColor = token.color;
            const tokenWidth = tokenValue.length;

            if (tokenColor === null) {
                col += tokenWidth;
                continue;
            }

            ctx.fillStyle = tokenColor;
            for (let i = 0; i < tokenWidth; i++) {
                const char = tokenValue[i];
                const charX = x0 + (col + i) * charWidth;

                ctx.fillText(char, charX, charY);
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
    return Math.min(CANVAS_MAX_PIXEL_SCALE, Math.max(CANVAS_MIN_PIXEL_SCALE, Math.ceil(deviceAwareZoom)));
}

function _renderAtScale() {
    const width = CANVAS_DEFAULTS.width;
    const height = CANVAS_DEFAULTS.height;
    const pixelScale = _computePixelScale(getCanvasZoom());
    const ctx = canvasElement.getContext('2d');

    _currentPixelScale = pixelScale;
    canvasElement.width = pixelScale * width;
    canvasElement.height = pixelScale * height;

    ctx.scale(pixelScale, pixelScale);
    render(ctx, width, height);
}

function _scheduleQualityRedraw(canvasZoom) {
    const neededPixelScale = _computePixelScale(canvasZoom);
    if (neededPixelScale === _currentPixelScale) {
        return;
    }

    clearTimeout(_qualityRedrawTimer);
    _qualityRedrawTimer = setTimeout(_renderAtScale, CANVAS_QUALITY_REDRAW_DEBOUNCE_MS);
}

function redraw() {
    _renderAtScale();

    const width = CANVAS_DEFAULTS.width;
    const height = CANVAS_DEFAULTS.height;
    const aspectRatio = width / height;

    canvasElement.style.width = _getNormalizedDimension(width);
    canvasElement.style.height = _getNormalizedDimension(height);

    const availableWidth = canvasWrapElement.clientWidth - CANVAS_AVAILABLE_MARGIN_OFFSET_PX;
    const availableHeight = canvasWrapElement.clientHeight - CANVAS_AVAILABLE_MARGIN_OFFSET_PX;

    let displayWidth = Math.min(availableWidth, availableHeight * aspectRatio);
    let displayHeight = displayWidth / aspectRatio;

    if (displayHeight > availableHeight) {
        displayHeight = availableHeight;
        displayWidth = displayHeight * aspectRatio;
    }

    canvasElement.style.width = _getNormalizedDimension(displayWidth);
    canvasElement.style.height = _getNormalizedDimension(displayHeight);

    updateZoomInfo();
}

setZoomChangeCallback(_scheduleQualityRedraw);

// Color controls

function updateColor(themeKey, themeValue) {
    getSwatchFillElement(themeKey).style.background = themeValue;
    getColorPickerElement(themeKey).value = themeValue;
    getHexInputElement(themeKey).value = themeValue;
}

function setColor(themeKey, themeValue) {
    config.colors[themeKey] = themeValue;
    updateColor(themeKey, themeValue);
    redraw();
}

export {
    redraw,
    render,
    setColor,
    setTokenizedLines,
    updateColor
};