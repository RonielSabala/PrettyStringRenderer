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

const _lastDimensions = (window.__BUFFER_DIMENSIONS ??= {
    width: 0,
    height: 0
});

let _currentPixelScale = 1;
let _qualityRedrawTimer = null;

const _ctx = (window.__BUFFER_CTX ??= getDrawingContext(canvasElement));

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

    if (bufferWidth !== _lastDimensions.width || bufferHeight !== _lastDimensions.height) {
        canvasElement.width = bufferWidth;
        canvasElement.height = bufferHeight;
        _lastDimensions.width = bufferWidth;
        _lastDimensions.height = bufferHeight;
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