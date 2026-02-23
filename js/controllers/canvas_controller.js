import {
    OUT_HEIGHT,
    OUT_WIDTH
} from '../common/config.js';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_FACTOR = 1.12;

let canvasZoom = 1;
let canvasPanX = 0;
let canvasPanY = 0;

let spaceHeld = false;
let panning = false;
let panStartX = 0;
let panStartY = 0;

const canvasWrap = document.getElementById('canvas-wrap');
const canvasInner = document.getElementById('canvas-inner');
const statusEl = document.getElementById('si');
const editor = document.getElementById('ed');

function updateZoomInfo() {
    statusEl.textContent = `${OUT_WIDTH}x${OUT_HEIGHT} · ${(canvasZoom * 100).toFixed(0)}%`;
}

function applyTransform() {
    canvasInner.style.transform = `translate(${canvasPanX}px,${canvasPanY}px) scale(${canvasZoom})`;
    updateZoomInfo();
}

// Zoom
canvasWrap.addEventListener('wheel', event => {
    event.preventDefault();

    const rect = canvasWrap.getBoundingClientRect();
    const mx = event.clientX - (rect.left + rect.width / 2);
    const my = event.clientY - (rect.top + rect.height / 2);

    const factor = event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

    canvasPanX = mx * (1 - factor) + canvasPanX * factor;
    canvasPanY = my * (1 - factor) + canvasPanY * factor;
    canvasZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, canvasZoom * factor));;

    applyTransform();
}, {
    passive: false
});

// Reset zoom
canvasWrap.addEventListener('dblclick', () => {
    canvasZoom = 1;
    canvasPanX = 0;
    canvasPanY = 0;
    applyTransform();
});

// Pan

document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || document.activeElement === editor) {
        return;
    }

    if (!spaceHeld) {
        spaceHeld = true;
        canvasWrap.style.cursor = 'grab';
    }

    event.preventDefault();
});

document.addEventListener('keyup', event => {
    if (event.code !== 'Space') {
        return;
    }

    spaceHeld = false;
    if (panning) {
        return;
    }

    canvasWrap.style.cursor = '';
});

canvasWrap.addEventListener('mousedown', event => {
    if (!spaceHeld) {
        return;
    }

    panning = true;
    panStartX = event.clientX - canvasPanX;
    panStartY = event.clientY - canvasPanY;
    canvasWrap.style.cursor = 'grabbing';
    event.preventDefault();
});

document.addEventListener('mousemove', event => {
    if (!panning) {
        return;
    }

    canvasPanX = event.clientX - panStartX;
    canvasPanY = event.clientY - panStartY;
    applyTransform();
});

document.addEventListener('mouseup', () => {
    if (!panning) {
        return;
    }

    panning = false;
    canvasWrap.style.cursor = spaceHeld ? 'grab' : '';
});

export {
    updateZoomInfo
};