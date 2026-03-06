import {
    CANVAS_DEFAULTS,
    CANVAS_MAX_ZOOM,
    CANVAS_MIN_ZOOM,
    CANVAS_PAN_SCROLL_SPEED,
    CANVAS_VIEWPORT_PADDING_PX,
    CANVAS_ZOOM_FACTOR
} from '../common/config.js';
import {
    CSS_CURSORS
} from '../common/constants/css.js';
import {
    KEYS
} from '../common/constants/keys.js';
import {
    canvasElement,
    canvasInnerElement,
    canvasWrapElement,
    editorElement,
    editorStatusElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    saveCanvasConfigState
} from '../utils/persistence.js';
import {
    describeResolution,
    toPx
} from '../utils/resolution.js';

let spaceHeld = false;
let panning = false;
let panStartX = 0;
let panStartY = 0;

let rafScheduled = false;
let onZoomChangeCallback = null;

export function updateZoomInfo() {
    const zoom = (state.canvasConfig.zoom * 100).toFixed(0);
    editorStatusElement.textContent = `${describeResolution()} · ${zoom}%`;
}

export function setZoomChangeCallback(callback) {
    onZoomChangeCallback = callback;
}

export function applyZoomTransform() {
    const config = state.canvasConfig;
    const panX = toPx(config.panX);
    const panY = toPx(config.panY);
    const zoom = config.zoom;

    rafScheduled = false;
    canvasInnerElement.style.transform = `translate(${panX},${panY}) scale(${zoom})`;
    updateZoomInfo();
}

function _scheduleTransform() {
    if (rafScheduled) {
        return;
    }

    rafScheduled = true;
    requestAnimationFrame(applyZoomTransform);
}

// Zoom

function _onZoomChange() {
    _scheduleTransform();
    if (onZoomChangeCallback === null) {
        return;
    }

    onZoomChangeCallback();
}

function _applyZoom(event) {
    const rect = canvasWrapElement.getBoundingClientRect();
    const pivotX = event.clientX - (rect.left + rect.width / 2);
    const pivotY = event.clientY - (rect.top + rect.height / 2);

    const config = state.canvasConfig;
    const oldZoom = config.zoom;
    const zoomFactor = event.deltaY < 0 ? CANVAS_ZOOM_FACTOR : 1 / CANVAS_ZOOM_FACTOR;
    const newZoom = Math.max(CANVAS_MIN_ZOOM, Math.min(CANVAS_MAX_ZOOM, oldZoom * zoomFactor));
    const appliedFactor = newZoom / oldZoom;

    config.zoom = newZoom;
    config.panX = pivotX * (1 - appliedFactor) + config.panX * appliedFactor;
    config.panY = pivotY * (1 - appliedFactor) + config.panY * appliedFactor;

    _onZoomChange();
}

function _applyScrollPan(deltaX, deltaY) {
    const config = state.canvasConfig;
    config.panX -= deltaX * CANVAS_PAN_SCROLL_SPEED;
    config.panY -= deltaY * CANVAS_PAN_SCROLL_SPEED;
    _scheduleTransform();
}

export function onZoom(event) {
    event.preventDefault();

    if (event.altKey) {
        _applyZoom(event);
    } else if (event.ctrlKey) {
        _applyScrollPan(event.deltaY, 0);
    } else {
        _applyScrollPan(0, event.deltaY);
    }

    saveCanvasConfigState();
}

export function onZoomReset() {
    const config = state.canvasConfig;
    config.zoom = CANVAS_DEFAULTS.zoom;
    config.panX = CANVAS_DEFAULTS.panX;
    config.panY = CANVAS_DEFAULTS.panY;
    _onZoomChange();
    saveCanvasConfigState();
}

// Pan

export function onSpace(event) {
    if (event.code !== KEYS.SPACE || document.activeElement === editorElement) {
        return;
    }

    event.preventDefault();

    if (!spaceHeld) {
        spaceHeld = true;
        canvasWrapElement.style.cursor = CSS_CURSORS.GRAB;
    }

}

export function onSpaceRelease(event) {
    if (event.code !== KEYS.SPACE) {
        return;
    }

    spaceHeld = false;
    if (panning) {
        return;
    }

    canvasWrapElement.style.cursor = CSS_CURSORS.DEFAULT;
}

export function onPanning(event) {
    if (!spaceHeld && event.button !== 2) {
        return;
    }

    panning = true;
    event.preventDefault();
    const config = state.canvasConfig;

    panStartX = event.clientX - config.panX;
    panStartY = event.clientY - config.panY;
    canvasWrapElement.style.cursor = CSS_CURSORS.GRABBING;
}

export function onPanningMove(event) {
    if (!panning) {
        return;
    }

    const config = state.canvasConfig;
    config.panX = event.clientX - panStartX;
    config.panY = event.clientY - panStartY;
    _scheduleTransform();
}

export function onPanningRelease() {
    if (!panning) {
        return;
    }

    panning = false;
    canvasWrapElement.style.cursor = spaceHeld ? CSS_CURSORS.GRAB : CSS_CURSORS.DEFAULT;
    saveCanvasConfigState();
}

function _getNormalizedDimension(dimension) {
    return toPx(Math.max(1, Math.round(dimension)));
}

export function adjustCanvas() {
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