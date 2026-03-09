import {
    CANVAS_DEFAULTS,
    CANVAS_MAX_PIXEL_SCALE,
    CANVAS_MIN_PIXEL_SCALE,
    CANVAS_QUALITY_REDRAW_TIMEOUT_MS
} from '../common/config.js';
import {
    canvasElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    setZoomChangeCallback
} from './controller.js';
import {
    getDrawingContext,
    render
} from './renderer.js';

let _lastCanvasWidth = 0;
let _lastCanvasHeight = 0;

let _currentPixelScale = 1;
let _qualityRedrawTimer = null;

const _ctx = getDrawingContext(canvasElement);

function _computePixelScale() {
    const deviceAwareZoom = state.canvasConfig.zoom * window.devicePixelRatio;
    return Math.min(CANVAS_MAX_PIXEL_SCALE, Math.max(CANVAS_MIN_PIXEL_SCALE, Math.ceil(deviceAwareZoom)));
}

export function redraw() {
    const width = CANVAS_DEFAULTS.width;
    const height = CANVAS_DEFAULTS.height;
    const pixelScale = _computePixelScale();

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

function _scheduleQualityRedraw() {
    const neededPixelScale = _computePixelScale();
    if (neededPixelScale === _currentPixelScale) {
        return;
    }

    clearTimeout(_qualityRedrawTimer);
    _qualityRedrawTimer = setTimeout(redraw, CANVAS_QUALITY_REDRAW_TIMEOUT_MS);
}

setZoomChangeCallback(_scheduleQualityRedraw);