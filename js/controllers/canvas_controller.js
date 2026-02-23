import {
    OUT_HEIGHT,
    OUT_WIDTH
} from '../common/config.js';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const ZOOM_FACTOR = 1.15;

let canvasZoom = 1;
let canvasPanX = 0;
let canvasPanY = 0;

let spaceHeld = false;
let panning = false;
let panStartX = 0;
let panStartY = 0;

const canvasWrapElement = document.getElementById('canvas-wrap');
const canvasInnerElement = document.getElementById('canvas-inner');
const statusElement = document.getElementById('si');
const editorElement = document.getElementById('ed');

function updateZoomInfo() {
    statusElement.textContent = `${OUT_WIDTH}x${OUT_HEIGHT} · ${(canvasZoom * 100).toFixed(0)}%`;
}

function _applyTransform() {
    canvasInnerElement.style.transform = `translate(${canvasPanX}px,${canvasPanY}px) scale(${canvasZoom})`;
    updateZoomInfo();
}

// Zoom

function onZoom(event) {
    event.preventDefault();

    const rect = canvasWrapElement.getBoundingClientRect();
    const mx = event.clientX - (rect.left + rect.width / 2);
    const my = event.clientY - (rect.top + rect.height / 2);

    const factor = event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

    canvasPanX = mx * (1 - factor) + canvasPanX * factor;
    canvasPanY = my * (1 - factor) + canvasPanY * factor;
    canvasZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, canvasZoom * factor));;

    _applyTransform();
}

function onZoomReset(event) {
    canvasZoom = 1;
    canvasPanX = 0;
    canvasPanY = 0;
    _applyTransform();
}

// Pan

function onSpace(event) {
    if (event.code !== 'Space' || document.activeElement === editorElement) {
        return;
    }

    if (!spaceHeld) {
        spaceHeld = true;
        canvasWrapElement.style.cursor = 'grab';
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

    canvasWrapElement.style.cursor = '';
}

function onPanning(event) {
    if (!spaceHeld) {
        return;
    }

    panning = true;
    panStartX = event.clientX - canvasPanX;
    panStartY = event.clientY - canvasPanY;
    canvasWrapElement.style.cursor = 'grabbing';
    event.preventDefault();
}

function onPanningMove(event) {
    if (!panning) {
        return;
    }

    canvasPanX = event.clientX - panStartX;
    canvasPanY = event.clientY - panStartY;
    _applyTransform();
}

function onPanningRelease() {
    if (!panning) {
        return;
    }

    panning = false;
    canvasWrapElement.style.cursor = spaceHeld ? 'grab' : '';
}

export {
    onPanning,
    onPanningMove,
    onPanningRelease,
    onSpace,
    onSpaceRelease,
    onZoom,
    onZoomReset,
    updateZoomInfo
};