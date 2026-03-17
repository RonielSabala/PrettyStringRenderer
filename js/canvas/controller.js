import {
    APP_FONT_VARIANT_LIGATURES,
    CANVAS_DEFAULTS,
    CANVAS_MAX_ZOOM,
    CANVAS_MIN_ZOOM,
    CANVAS_PAN_SCROLL_SPEED,
    CANVAS_ZOOM_FACTOR
} from '../common/config.js';
import {
    CSS_CURSORS
} from '../common/constants/css.js';
import {
    EVENTS
} from '../common/constants/events.js';
import {
    KEYS
} from '../common/constants/keys.js';
import {
    canvasElement,
    canvasInnerElement,
    canvasWrapElement,
    editorElement,
    fitToContentElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    createSaveScheduler,
    saveCanvasConfigState
} from '../utils/persistence.js';
import {
    toPx
} from '../utils/resolution.js';
import {
    updateEditorZoomInfo
} from '../utils/ui_sync.js';
import {
    redraw,
    scheduleQualityRedraw
} from './buffer.js';

let spaceHeld = false;
let panning = false;
let panStartX = 0;
let panStartY = 0;

let rafScheduled = false;
const _scheduleCanvasConfigSave = createSaveScheduler(saveCanvasConfigState);

// Helpers

function _resetZoom() {
    const config = state.canvasConfig;
    const zoom = CANVAS_DEFAULTS.zoom;
    const panX = CANVAS_DEFAULTS.panX;
    const panY = CANVAS_DEFAULTS.panY;

    if (config.zoom === zoom &&
        config.panX === panX &&
        config.panY === panY) {
        return false;
    }

    config.zoom = zoom;
    config.panX = panX;
    config.panY = panY;
    return true;
}

function _applyZoomTransform() {
    const config = state.canvasConfig;
    const panX = toPx(config.panX);
    const panY = toPx(config.panY);
    const zoom = config.zoom;

    canvasInnerElement.style.transform = `translate(${panX},${panY}) scale(${zoom})`;
    updateEditorZoomInfo();
    rafScheduled = false;
}

function _scheduleTransform() {
    if (rafScheduled) {
        return;
    }

    rafScheduled = true;
    requestAnimationFrame(_applyZoomTransform);
}

// Zoom helpers

function _onZoomChange() {
    _scheduleTransform();
    scheduleQualityRedraw();
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

// Canvas listeners

function _onZoom(event) {
    event.preventDefault();

    if (event.altKey) {
        _applyZoom(event);
    } else if (event.ctrlKey) {
        _applyScrollPan(event.deltaY, 0);
    } else {
        _applyScrollPan(0, event.deltaY);
    }

    _scheduleCanvasConfigSave();
}

function _onZoomReset() {
    const reset = _resetZoom();
    if (!reset) {
        return;
    }

    _onZoomChange();
    saveCanvasConfigState();
}

function _onPanning(event) {
    if (!spaceHeld && event.button !== 2) {
        return;
    }

    event.preventDefault();
    const config = state.canvasConfig;

    panning = true;
    panStartX = event.clientX - config.panX;
    panStartY = event.clientY - config.panY;
    canvasWrapElement.style.cursor = CSS_CURSORS.GRABBING;
}

function _onFitToContent() {
    state.canvasConfig.fitToContent = fitToContentElement.checked;
    _resetZoom();
    _scheduleTransform();
    saveCanvasConfigState();
    redraw(true);
}

// Document listeners

function _onSpace(event) {
    if (event.code !== KEYS.SPACE || document.activeElement === editorElement) {
        return;
    }

    event.preventDefault();
    if (spaceHeld) {
        return
    }

    spaceHeld = true;
    canvasWrapElement.style.cursor = CSS_CURSORS.GRAB;

}

function _onSpaceRelease(event) {
    if (event.code !== KEYS.SPACE) {
        return;
    }

    spaceHeld = false;
    if (panning) {
        return;
    }

    canvasWrapElement.style.cursor = CSS_CURSORS.DEFAULT;
}

function _onPanningMove(event) {
    if (!panning) {
        return;
    }

    const config = state.canvasConfig;
    config.panX = event.clientX - panStartX;
    config.panY = event.clientY - panStartY;
    _scheduleTransform();
}

function _onPanningRelease() {
    if (!panning) {
        return;
    }

    panning = false;
    canvasWrapElement.style.cursor = spaceHeld ? CSS_CURSORS.GRAB : CSS_CURSORS.DEFAULT;
    saveCanvasConfigState();
}

// Public methods

export function initCanvas(signal) {
    canvasElement.style.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;
    fitToContentElement.checked = state.canvasConfig.fitToContent;

    _applyZoomTransform();

    // Canvas listeners
    canvasWrapElement.addEventListener(EVENTS.CONTEXT_MENU, (e) => e.preventDefault(), {
        signal
    });
    canvasWrapElement.addEventListener(EVENTS.WHEEL, _onZoom, {
        passive: false,
        signal
    });
    canvasWrapElement.addEventListener(EVENTS.DBL_CLICK, _onZoomReset, {
        signal
    });
    canvasWrapElement.addEventListener(EVENTS.MOUSE_DOWN, _onPanning, {
        signal
    });
    fitToContentElement.addEventListener(EVENTS.CHANGE, _onFitToContent, {
        signal
    });

    // Document listeners
    document.addEventListener(EVENTS.KEY_DOWN, _onSpace, {
        signal
    });
    document.addEventListener(EVENTS.KEY_UP, _onSpaceRelease, {
        signal
    });
    document.addEventListener(EVENTS.MOUSE_MOVE, _onPanningMove, {
        signal
    });
    document.addEventListener(EVENTS.MOUSE_UP, _onPanningRelease, {
        signal
    });
}