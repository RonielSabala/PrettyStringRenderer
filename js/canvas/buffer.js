import {
    CANVAS_DEFAULTS,
    CANVAS_MAX_PIXEL_SCALE,
    CANVAS_MIN_PIXEL_SCALE,
    CANVAS_REDRAW_TIMEOUT_MS,
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
    charWidthMetric,
    getDrawingContext,
    render,
    updateTextMetrics
} from './renderer.js';

let _currentPixelScale = 1;
let _redrawTimer = null;

let _lastBufferWidth = null;
let _lastBufferHeight = null;

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
    const width = Math.ceil(padX * 2 + tokenizer.maxLine * charWidthMetric);
    const height = Math.ceil(padY * 2 + tokenizer.linesCount * lineHeight);

    return {
        width,
        height
    };
}

// Public methods

export function adjustCanvas(pixelScale = null) {
    const availableWidth = canvasWrapElement.clientWidth - CANVAS_VIEWPORT_PADDING_PX;
    const availableHeight = canvasWrapElement.clientHeight - CANVAS_VIEWPORT_PADDING_PX;

    let displayWidth, displayHeight;
    if (state.canvasConfig.fitToContent) {
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

    const {
        width,
        height
    } = fitToContent ? _calculateFitToContentDimensions() : CANVAS_DEFAULTS;

    const pixelScale = _getPixelScale();
    _currentPixelScale = pixelScale;

    const bufferWidth = pixelScale * width;
    const bufferHeight = pixelScale * height;
    const sizeChanged = bufferWidth !== _lastBufferWidth || bufferHeight !== _lastBufferHeight;

    if (sizeChanged) {
        _lastBufferWidth = bufferWidth;
        _lastBufferHeight = bufferHeight;

        canvasElement.width = bufferWidth;
        canvasElement.height = bufferHeight;
        _ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
    }

    render(_ctx, width, height);

    if (!forceCanvasAdjustment && (!sizeChanged || !fitToContent)) {
        return;
    }

    canvasConfig.width = width;
    canvasConfig.height = height;
    adjustCanvas(pixelScale);
    saveCanvasConfigState();
    updateResolutionBadge();
}

export function scheduleRedraw() {
    if (_currentPixelScale === _getPixelScale()) {
        return;
    }

    clearTimeout(_redrawTimer);
    _redrawTimer = setTimeout(redraw, CANVAS_REDRAW_TIMEOUT_MS);
}