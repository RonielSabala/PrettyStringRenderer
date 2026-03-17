import {
    CANVAS_DEFAULTS,
    CANVAS_MAX_PIXEL_SCALE,
    CANVAS_MIN_PIXEL_SCALE,
    CANVAS_QUALITY_REDRAW_TIMEOUT_MS,
    CANVAS_VIEWPORT_PADDING_PX
} from '../common/config.js';
import {
    canvasElement,
    canvasWrapElement
} from '../common/elements.js';
import {
    state,
    tokenizer
} from '../common/store.js';
import {
    saveCanvasConfigState
} from '../utils/persistence.js';
import {
    toPx
} from '../utils/resolution.js';
import {
    updateResolutionBadge
} from '../utils/ui_sync.js';
import {
    getDrawingContext,
    render,
    textMetrics,
    updateTextMetrics
} from './renderer.js';

const _lastDimensions = (window.__BUFFER_DIMENSIONS ??= {
    width: 0,
    height: 0
});

let _currentPixelScale = 1;
let _qualityRedrawTimer = null;

const _ctx = (window.__BUFFER_CTX ??= getDrawingContext(canvasElement));

// Private helpers

function _getNormalizedDimension(dimension) {
    return toPx(Math.max(1, Math.round(dimension)));
}

function _getPixelScale() {
    const zoom = Math.ceil(state.canvasConfig.zoom);
    return Math.min(CANVAS_MAX_PIXEL_SCALE, Math.max(CANVAS_MIN_PIXEL_SCALE, zoom));
}

function _calculateFitToContentDimensions() {
    const config = state.typographyConfig;
    updateTextMetrics(config)

    const padX = config.padX;
    const padY = config.padY;
    const lineHeight = config.fontSize * config.lineHeight;
    const charWidth = textMetrics.charWidth;

    const width = Math.ceil(padX * 2 + tokenizer.maxLine * charWidth);
    const height = Math.ceil(padY * 2 + tokenizer.linesCount * lineHeight);

    return [width, height];
}

// Public methods

export function adjustCanvas(pixelScale = null) {
    let displayWidth, displayHeight;
    const config = state.canvasConfig;
    const availableWidth = canvasWrapElement.clientWidth - CANVAS_VIEWPORT_PADDING_PX;
    const availableHeight = canvasWrapElement.clientHeight - CANVAS_VIEWPORT_PADDING_PX;

    if (config.fitToContent) {
        if (pixelScale === null) {
            pixelScale = _getPixelScale();
        }

        const bufferWidth = canvasElement.width / pixelScale;
        const bufferHeight = canvasElement.height / pixelScale;
        const scale = Math.min(1, availableWidth / bufferWidth, availableHeight / bufferHeight);
        displayWidth = scale * bufferWidth;
        displayHeight = scale * bufferHeight;
    } else {
        const aspectRatio = CANVAS_DEFAULTS.aspectRatio;
        displayWidth = Math.min(availableWidth, availableHeight * aspectRatio);
        displayHeight = Math.min(availableHeight, displayWidth / aspectRatio);
    }

    canvasElement.style.width = _getNormalizedDimension(displayWidth);
    canvasElement.style.height = _getNormalizedDimension(displayHeight);
}

export function redraw(forceCanvasAdjustment = false) {
    const canvasConfig = state.canvasConfig;
    const fitToContent = canvasConfig.fitToContent;
    const pixelScale = _getPixelScale();

    let width, height;
    if (fitToContent) {
        [width, height] = _calculateFitToContentDimensions();
    } else {
        width = CANVAS_DEFAULTS.width;
        height = CANVAS_DEFAULTS.height;
    }

    const bufferWidth = pixelScale * width;
    const bufferHeight = pixelScale * height;

    const sizeChanged = bufferWidth !== _lastDimensions.width ||
        bufferHeight !== _lastDimensions.height;

    if (sizeChanged) {
        canvasElement.width = bufferWidth;
        canvasElement.height = bufferHeight;
        _lastDimensions.width = bufferWidth;
        _lastDimensions.height = bufferHeight;
    }

    _currentPixelScale = pixelScale;
    _ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
    render(_ctx, width, height);

    if (!(forceCanvasAdjustment || sizeChanged && fitToContent)) {
        return;
    }

    adjustCanvas(pixelScale);
    if (canvasConfig.width === width && canvasConfig.height === height) {
        return;
    }

    canvasConfig.width = width;
    canvasConfig.height = height;
    saveCanvasConfigState();
    updateResolutionBadge();
}

export function scheduleQualityRedraw() {
    const neededPixelScale = _getPixelScale();
    if (neededPixelScale === _currentPixelScale) {
        return;
    }

    clearTimeout(_qualityRedrawTimer);
    _qualityRedrawTimer = setTimeout(redraw, CANVAS_QUALITY_REDRAW_TIMEOUT_MS);
}