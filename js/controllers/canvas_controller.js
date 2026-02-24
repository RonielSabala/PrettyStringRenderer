import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH
} from '../common/config.js';

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 10;
const ZOOM_FACTOR = 1.15;

let canvasZoom = 1;
let canvasPanX = 0;
let canvasPanY = 0;

let spaceHeld = false;
let panning = false;
let panStartX = 0;
let panStartY = 0;

let rafScheduled = false;
let onZoomChangeCallback = null;

const statusElement = document.getElementById('si');
const editorElement = document.getElementById('ed');
const canvasWrapElement = document.getElementById('canvas-wrap');
const canvasInnerElement = document.getElementById('canvas-inner');

const Cursor = Object.freeze({
    DEFAULT: '',
    GRAB: 'grab',
    GRABBING: 'grabbing'
});

function getCanvasZoom() {
    return canvasZoom;
}

function setZoomChangeCallback(callback) {
    onZoomChangeCallback = callback;
}

function updateZoomInfo() {
    statusElement.textContent = `${CANVAS_WIDTH}x${CANVAS_HEIGHT} · ${(canvasZoom * 100).toFixed(0)}%`;
}

function _applyTransform() {
    canvasInnerElement.style.transform = `translate(${canvasPanX}px,${canvasPanY}px) scale(${canvasZoom})`;
    updateZoomInfo();
    rafScheduled = false;
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

function onZoom(event) {
    event.preventDefault();

    const rect = canvasWrapElement.getBoundingClientRect();
    const pivotX = event.clientX - (rect.left + rect.width / 2);
    const pivotY = event.clientY - (rect.top + rect.height / 2);

    const zoomFactor = event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, canvasZoom * zoomFactor));
    const appliedFactor = newZoom / canvasZoom;

    canvasPanX = pivotX * (1 - appliedFactor) + canvasPanX * appliedFactor;
    canvasPanY = pivotY * (1 - appliedFactor) + canvasPanY * appliedFactor;
    canvasZoom = newZoom;

    _onZoomChange();
}

function onZoomReset(event) {
    canvasZoom = 1;
    canvasPanX = 0;
    canvasPanY = 0;
    _onZoomChange();
}

// Pan

function onSpace(event) {
    if (event.code !== 'Space' || document.activeElement === editorElement) {
        return;
    }

    if (!spaceHeld) {
        spaceHeld = true;
        canvasWrapElement.style.cursor = Cursor.GRAB;
    }

    event.preventDefault();
}

function onSpaceRelease(event) {
    if (event.code !== 'Space') {
        return;
    }

    spaceHeld = false;
    if (panning) {
        return;
    }

    canvasWrapElement.style.cursor = Cursor.DEFAULT;
}

function onPanning(event) {
    if (!spaceHeld) {
        return;
    }

    panning = true;
    panStartX = event.clientX - canvasPanX;
    panStartY = event.clientY - canvasPanY;
    canvasWrapElement.style.cursor = Cursor.GRABBING;
    event.preventDefault();
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
    canvasWrapElement.style.cursor = spaceHeld ? Cursor.GRAB : Cursor.DEFAULT;
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