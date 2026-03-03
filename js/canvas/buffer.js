import {
    CANVAS_CONTEXT_TYPE,
    CANVAS_DEFAULTS,
    CANVAS_MAX_PIXEL_SCALE,
    CANVAS_MIN_PIXEL_SCALE,
    CANVAS_QUALITY_REDRAW_DEBOUNCE_MS,
    CANVAS_VIEWPORT_PADDING_PX
} from '../common/config.js';
import {
    canvasElement,
    canvasWrapElement
} from '../common/elements.js';
import {
    toPx
} from '../utils/resolution.js';
import {
    getCanvasZoom,
    setZoomChangeCallback
} from './controller.js';
import {
    render
} from './renderer.js';

let _lastCanvasWidth = 0;
let _lastCanvasHeight = 0;

let _currentPixelScale = 1;
let _qualityRedrawTimer = null;

const _ctx = canvasElement.getContext(CANVAS_CONTEXT_TYPE);

function _getNormalizedDimension(dimension) {
    return toPx(Math.max(1, Math.round(dimension)));
}

function _computePixelScale(canvasZoom) {
    const deviceAwareZoom = canvasZoom * window.devicePixelRatio;
    return Math.min(CANVAS_MAX_PIXEL_SCALE, Math.max(CANVAS_MIN_PIXEL_SCALE, Math.ceil(deviceAwareZoom)));
}

function _renderAtScale() {
    const width = CANVAS_DEFAULTS.width;
    const height = CANVAS_DEFAULTS.height;
    const pixelScale = _computePixelScale(getCanvasZoom());

    const bufferWidth = pixelScale * width;
    const bufferHeight = pixelScale * height;

    if (bufferWidth !== _lastCanvasWidth || bufferHeight !== _lastCanvasHeight) {
        canvasElement.width = bufferWidth;
        canvasElement.height = bufferHeight;
        _lastCanvasWidth = bufferWidth;
        _lastCanvasHeight = bufferHeight;
    }

    _currentPixelScale = pixelScale;
    _ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
    render(_ctx, width, height);
}

function _scheduleQualityRedraw(canvasZoom) {
    const neededPixelScale = _computePixelScale(canvasZoom);
    if (neededPixelScale === _currentPixelScale) {
        return;
    }

    clearTimeout(_qualityRedrawTimer);
    _qualityRedrawTimer = setTimeout(_renderAtScale, CANVAS_QUALITY_REDRAW_DEBOUNCE_MS);
}

export function redraw() {
    _renderAtScale();

    const aspectRatio = CANVAS_DEFAULTS.aspectRatio;
    const availableWidth = canvasWrapElement.clientWidth - CANVAS_VIEWPORT_PADDING_PX;
    const availableHeight = canvasWrapElement.clientHeight - CANVAS_VIEWPORT_PADDING_PX;

    let displayWidth = Math.min(availableWidth, availableHeight * aspectRatio);
    let displayHeight = displayWidth / aspectRatio;

    if (displayHeight > availableHeight) {
        displayHeight = availableHeight;
        displayWidth = displayHeight * aspectRatio;
    }

    canvasElement.style.width = _getNormalizedDimension(displayWidth);
    canvasElement.style.height = _getNormalizedDimension(displayHeight);
}

setZoomChangeCallback(_scheduleQualityRedraw);