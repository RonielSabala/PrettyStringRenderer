import {
    CANVAS_MAX_ZOOM,
    CANVAS_MIN_ZOOM,
    CANVAS_PAN_SCROLL_SPEED,
    CANVAS_ZOOM_FACTOR
} from '../common/config.js';
import {
    CSS_CURSORS
} from '../common/css_classes.js';
import {
    canvasInnerElement,
    canvasWrapElement,
    editorElement,
    editorStatusElement
} from '../common/elements.js';
import {
    KEYS
} from '../common/keys.js';
import {
    describeResolution,
    toPx
} from '../utils/resolution.js';

let canvasZoom = 1;
let canvasPanX = 0;
let canvasPanY = 0;

let spaceHeld = false;
let panning = false;
let panStartX = 0;
let panStartY = 0;

let rafScheduled = false;
let onZoomChangeCallback = null;

function getCanvasZoom() {
    return canvasZoom;
}

function updateZoomInfo() {
    editorStatusElement.textContent = `${describeResolution()} · ${(canvasZoom * 100).toFixed(0)}%`;
}

function setZoomChangeCallback(callback) {
    onZoomChangeCallback = callback;
}

function _applyTransform() {
    rafScheduled = false;
    canvasInnerElement.style.transform = `translate(${toPx(canvasPanX)},${toPx(canvasPanY)}) scale(${canvasZoom})`;
    updateZoomInfo();
}

function _scheduleTransform() {
    if (rafScheduled) {
        return;
    }

    rafScheduled = true;
    requestAnimationFrame(_applyTransform);
}

// Zoom

function _onZoomChange() {
    _scheduleTransform();
    if (onZoomChangeCallback === null) {
        return;
    }

    onZoomChangeCallback(canvasZoom);
}

function _applyZoom(event) {
    const rect = canvasWrapElement.getBoundingClientRect();
    const pivotX = event.clientX - (rect.left + rect.width / 2);
    const pivotY = event.clientY - (rect.top + rect.height / 2);

    const zoomFactor = event.deltaY < 0 ? CANVAS_ZOOM_FACTOR : 1 / CANVAS_ZOOM_FACTOR;
    const newZoom = Math.max(CANVAS_MIN_ZOOM, Math.min(CANVAS_MAX_ZOOM, canvasZoom * zoomFactor));
    const appliedFactor = newZoom / canvasZoom;

    canvasPanX = pivotX * (1 - appliedFactor) + canvasPanX * appliedFactor;
    canvasPanY = pivotY * (1 - appliedFactor) + canvasPanY * appliedFactor;
    canvasZoom = newZoom;

    _onZoomChange();
}

function _applyScrollPan(deltaX, deltaY) {
    canvasPanX -= deltaX * CANVAS_PAN_SCROLL_SPEED;
    canvasPanY -= deltaY * CANVAS_PAN_SCROLL_SPEED;
    _scheduleTransform();
}

function onZoom(event) {
    event.preventDefault();

    if (event.altKey) {
        _applyZoom(event);
    } else if (event.ctrlKey) {
        _applyScrollPan(event.deltaY, 0);
    } else {
        _applyScrollPan(0, event.deltaY);
    }
}

function onZoomReset(event) {
    canvasZoom = 1;
    canvasPanX = 0;
    canvasPanY = 0;
    _onZoomChange();
}

// Pan

function onSpace(event) {
    if (event.code !== KEYS.SPACE || document.activeElement === editorElement) {
        return;
    }

    event.preventDefault();

    if (!spaceHeld) {
        spaceHeld = true;
        canvasWrapElement.style.cursor = CSS_CURSORS.GRAB;
    }

}

function onSpaceRelease(event) {
    if (event.code !== KEYS.SPACE) {
        return;
    }

    spaceHeld = false;
    if (panning) {
        return;
    }

    canvasWrapElement.style.cursor = CSS_CURSORS.DEFAULT;
}

function onPanning(event) {
    if (!spaceHeld && event.button !== 2) {
        return;
    }

    event.preventDefault();

    panning = true;
    panStartX = event.clientX - canvasPanX;
    panStartY = event.clientY - canvasPanY;
    canvasWrapElement.style.cursor = CSS_CURSORS.GRABBING;
}

function onPanningMove(event) {
    if (!panning) {
        return;
    }

    canvasPanX = event.clientX - panStartX;
    canvasPanY = event.clientY - panStartY;
    _scheduleTransform();
}

function onPanningRelease() {
    if (!panning) {
        return;
    }

    panning = false;
    canvasWrapElement.style.cursor = spaceHeld ? CSS_CURSORS.GRAB : CSS_CURSORS.DEFAULT;
}

export {
    getCanvasZoom,
    onPanning,
    onPanningMove,
    onPanningRelease,
    onSpace,
    onSpaceRelease,
    onZoom,
    onZoomReset,
    setZoomChangeCallback,
    updateZoomInfo
};