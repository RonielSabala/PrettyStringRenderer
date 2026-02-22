import {
    OUT_HEIGHT,
    OUT_WIDTH
} from "./config.js";

// ZOOM + PAN
let cvZoom = 1,
    cvPanX = 0,
    cvPanY = 0;

let spaceHeld = false,
    panning = false,
    panStartX = 0,
    panStartY = 0;

function updateZoomInfo() {
    let newValue = `${OUT_WIDTH}x${OUT_HEIGHT} · ${(cvZoom * 100).toFixed(0)}%`;
    document.getElementById('si').textContent = newValue;
}

function applyTransform() {
    let newValue = `translate(${cvPanX}px,${cvPanY}px) scale(${cvZoom})`;
    document.getElementById('cv-inner').style.transform = newValue;
    updateZoomInfo();
}

document.getElementById('cv-wrap').addEventListener('wheel', e => {
    e.preventDefault();

    const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const rect = document.getElementById('cv-wrap').getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);

    cvPanX = mx * (1 - f) + cvPanX * f;
    cvPanY = my * (1 - f) + cvPanY * f;
    cvZoom = Math.max(0.05, Math.min(40, cvZoom * f));

    applyTransform();
}, {
    passive: false
});


// Reset zoom
document.getElementById('cv-wrap').addEventListener('dblclick', () => {
    cvZoom = 1;
    cvPanX = 0;
    cvPanY = 0;
    applyTransform();
});

// Start pan
document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || document.activeElement === document.getElementById('ed')) {
        return;
    }

    if (!spaceHeld) {
        spaceHeld = true;
        document.getElementById('cv-wrap').style.cursor = 'grab';
    }

    event.preventDefault();
});

// End pan
document.addEventListener('keyup', event => {
    if (event.code !== 'Space') {
        return;
    }

    spaceHeld = false;
    if (panning) {
        return;
    }

    document.getElementById('cv-wrap').style.cursor = '';
});

// Start grabbing action
document.getElementById('cv-wrap').addEventListener('mousedown', event => {
    if (!spaceHeld) {
        return;
    }

    panning = true;
    panStartX = event.clientX - cvPanX;
    panStartY = event.clientY - cvPanY;

    document.getElementById('cv-wrap').style.cursor = 'grabbing';
    event.preventDefault();
});

// Grabbing action
document.addEventListener('mousemove', event => {
    if (!panning) {
        return;
    }

    cvPanX = event.clientX - panStartX;
    cvPanY = event.clientY - panStartY;
    applyTransform();
});

// End grabbing action
document.addEventListener('mouseup', () => {
    if (!panning) return;
    panning = false;
    document.getElementById('cv-wrap').style.cursor = spaceHeld ? 'grab' : '';
});

export {
    updateZoomInfo
};