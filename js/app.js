import {
    BRACKETS
} from "./brackets.js";
import {
    ASPECT_RATIO,
    config,
    OUT_HEIGHT,
    OUT_WIDTH
} from "./config.js";
import {
    tokenize
} from "./tokenizer.js";
import {
    T
} from "./tokens.js";
'use strict';


function resolveColor(token) {
    const colors = config.colors;
    switch (token.t) {
        case T.BRACKET:
            return colors[`bracket${token.d}`];
        case T.OPERATOR:
            return colors.operator;
        case T.FUNCTION:
            return colors.function;
        case T.VARIABLE:
            return colors.variable;
        case T.SEMICOLON:
            return colors.semicolon;
        case T.COMMENT:
            return colors.comment;
        case T.NUMBER:
            return colors.number;
        case T.WS:
            return null;
        default:
            return colors.unknown;
    }
}

function render(ctx, lines, W, H) {
    const fs = config.fontSize;
    const px0 = config.canvasPadX;
    const py0 = config.canvasPadY;
    const ls = config.letterSpacing;

    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, W, H);

    ctx.font = `400 ${fs}px 'Cascadia Code','Courier New',monospace`;
    ctx.textBaseline = 'alphabetic';

    const cw = ctx.measureText('M').width + ls;
    const lhpx = fs * config.lineHeight;
    const x0 = px0;
    const y0 = py0 + fs * 0.82;

    for (let row = 0; row < lines.length; row++) {
        let col = 0;
        const cy = y0 + row * lhpx;
        for (const tok of lines[row]) {
            const cl = resolveColor(tok);
            if (!cl) {
                col += tok.v.length;
                continue;
            }
            ctx.fillStyle = cl;
            for (let c = 0; c < tok.v.length; c++) {
                ctx.fillText(tok.v[c], x0 + (col + c) * cw, cy);
            }
            col += tok.v.length;
        }
    }
}

// PREVIEW
let tokenLines = [];

function redraw() {
    tokenLines = tokenize(document.getElementById('ed').value);

    const canvas = document.getElementById('canvas');
    const wrap = document.getElementById('cv-wrap');

    // Canvas always at full output resolution
    canvas.width = OUT_WIDTH;
    canvas.height = OUT_HEIGHT;

    render(canvas.getContext('2d'), tokenLines, OUT_WIDTH, OUT_HEIGHT);

    // CSS display size fits wrap, preserving aspect ratio
    const wW = wrap.clientWidth - 40;
    const wH = wrap.clientHeight - 40;
    let dW = Math.min(wW, wH * ASPECT_RATIO);
    let dH = dW / ASPECT_RATIO;
    if (dH > wH) {
        dH = wH;
        dW = dH * ASPECT_RATIO;
    }
    canvas.style.width = Math.max(1, Math.round(dW)) + 'px';
    canvas.style.height = Math.max(1, Math.round(dH)) + 'px';

    updateZoomInfo();
}

// ZOOM + PAN
let cvZoom = 1,
    cvPanX = 0,
    cvPanY = 0;
let spaceHeld = false,
    panning = false,
    panStartX = 0,
    panStartY = 0;

function applyTransform() {
    document.getElementById('cv-inner').style.transform =
        `translate(${cvPanX}px,${cvPanY}px) scale(${cvZoom})`;
    updateZoomInfo();
}

function updateZoomInfo() {
    document.getElementById('si').textContent =
        `${OUT_WIDTH}×${OUT_HEIGHT} · ${(cvZoom * 100).toFixed(0)}%`;
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

document.getElementById('cv-wrap').addEventListener('dblclick', () => {
    cvZoom = 1;
    cvPanX = 0;
    cvPanY = 0;
    applyTransform();
});

document.addEventListener('keydown', e => {
    if (e.code === 'Space' && document.activeElement !== document.getElementById('ed')) {
        if (!spaceHeld) {
            spaceHeld = true;
            document.getElementById('cv-wrap').style.cursor = 'grab';
        }
        e.preventDefault();
    }
});
document.addEventListener('keyup', e => {
    if (e.code === 'Space') {
        spaceHeld = false;
        if (!panning) document.getElementById('cv-wrap').style.cursor = '';
    }
});
document.getElementById('cv-wrap').addEventListener('mousedown', e => {
    if (spaceHeld) {
        panning = true;
        panStartX = e.clientX - cvPanX;
        panStartY = e.clientY - cvPanY;
        document.getElementById('cv-wrap').style.cursor = 'grabbing';
        e.preventDefault();
    }
});
document.addEventListener('mousemove', e => {
    if (!panning) return;
    cvPanX = e.clientX - panStartX;
    cvPanY = e.clientY - panStartY;
    applyTransform();
});
document.addEventListener('mouseup', () => {
    if (!panning) return;
    panning = false;
    document.getElementById('cv-wrap').style.cursor = spaceHeld ? 'grab' : '';
});

// EXPORT
function doExport() {
    const mul = parseFloat(
        prompt('Scale multiplier:\n  1  → 3120×780\n  2  → 6240×1560\n  0.5 → 1560×390', '1')
    );
    if (isNaN(mul) || mul <= 0) return;

    const W = Math.round(OUT_WIDTH * mul),
        H = Math.round(OUT_HEIGHT * mul);
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;

    // Scale config measurements for the off-screen canvas
    const s = {
        fs: config.fontSize,
        ls: config.letterSpacing,
        px: config.canvasPadX,
        py: config.canvasPadY
    };
    config.fontSize *= mul;
    config.letterSpacing *= mul;
    config.canvasPadX *= mul;
    config.canvasPadY *= mul;
    render(off.getContext('2d'), tokenLines, W, H);
    config.fontSize = s.fs;
    config.letterSpacing = s.ls;
    config.canvasPadX = s.px;
    config.canvasPadY = s.py;

    off.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `code-art-${W}x${H}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
    }, 'image/png');
}

// COLOR CONTROLS
function setColor(key, value, isBg) {
    const fill = document.getElementById(`sf-${key}`);
    const pick = document.getElementById(`cp-${key}`);
    const hex = document.getElementById(`hx-${key}`);
    if (fill) fill.style.background = value;
    if (pick) pick.value = value;
    if (hex) hex.value = value;

    if (isBg) {
        config.colors.background = value;
    } else {
        config.colors[key] = value;
        // Refresh operator chips whenever operator color changes
        if (key === 'operator') renderOpChips();
    }
    redraw();
}

function onPick(key, v) {
    setColor(key, v);
}

function onHex(key, v) {
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) setColor(key, v);
}

function onBgPick(v) {
    setColor('background', v, true);
}

function onBgHex(v) {
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) setColor('background', v, true);
}

// Apply a full theme object — syncs all color controls and redraws
function applyTheme(theme) {
    const keys = ['bracket0', 'bracket1', 'bracket2', 'function', 'variable',
        'operator', 'semicolon', 'number', 'comment', 'unknown'
    ];
    for (const k of keys) {
        if (theme[k]) setColor(k, theme[k]);
    }
    if (theme.background) setColor('background', theme.background, true);
    // Ensure operator chips reflect the new operator color
    renderOpChips();
}

// TYPOGRAPHY
function onCfg() {
    config.fontSize = parseFloat(document.getElementById('c-fs').value) || 85;
    config.lineHeight = parseFloat(document.getElementById('c-lh').value) || 1.15;
    config.letterSpacing = parseFloat(document.getElementById('c-ls').value) || 0;
    config.canvasPadX = parseFloat(document.getElementById('c-px').value) || 64;
    config.canvasPadY = parseFloat(document.getElementById('c-py').value) || 4;
    redraw();
}

function onEdit() {
    redraw();
}

function onEdFontSize() {
    const sz = parseFloat(document.getElementById('ed-fs').value) || 16;
    document.getElementById('ed').style.fontSize = sz + 'px';
}

// THEMES
let themes = [];
let activeThemeName = '';
let storedDirHandle = null; // persisted via IndexedDB

// ── IndexedDB helpers ──────────────────────────────────────
const IDB = {
    async open() {
        return new Promise((res, rej) => {
            const req = indexedDB.open('code-art-renderer', 1);
            req.onupgradeneeded = e => e.target.result.createObjectStore('kv');
            req.onsuccess = e => res(e.target.result);
            req.onerror = rej;
        });
    },
    async get(key) {
        const db = await this.open();
        return new Promise((res, rej) => {
            const tx = db.transaction('kv', 'readonly');
            const req = tx.objectStore('kv').get(key);
            req.onsuccess = () => res(req.result ?? null);
            req.onerror = rej;
        });
    },
    async set(key, val) {
        const db = await this.open();
        return new Promise((res, rej) => {
            const tx = db.transaction('kv', 'readwrite');
            tx.objectStore('kv').put(val, key);
            tx.oncomplete = res;
            tx.onerror = rej;
        });
    },
};

// ── Read JSON files from a FileSystemDirectoryHandle ───────
async function loadFromDirHandle(handle) {
    const loaded = [];
    for await (const [name, fh] of handle.entries()) {
        if (fh.kind === 'file' && name.toLowerCase().endsWith('.json')) {
            try {
                const file = await fh.getFile();
                const json = JSON.parse(await file.text());
                json._name = name.replace(/\.json$/i, '');
                loaded.push(json);
            } catch (e) {
                console.warn('Skipping', name, e);
            }
        }
    }
    if (loaded.length) {
        for (const t of loaded) {
            const idx = themes.findIndex(x => x._name === t._name);
            if (idx >= 0) themes[idx] = t;
            else themes.push(t);
        }
        renderThemeList();
    }
    return loaded.length;
}

// ── Auto-load on startup using stored handle ────────────────
// Uses the File System Access API + IndexedDB to silently reload
// the last-used folder if permission is still valid for this session.
async function tryAutoLoad() {
    if (!('showDirectoryPicker' in window)) return;
    try {
        const handle = await IDB.get('dirHandle');
        if (!handle) return;
        storedDirHandle = handle;
        const perm = await handle.queryPermission({
            mode: 'read'
        });
        if (perm === 'granted') {
            // Permission still active — load silently
            await loadFromDirHandle(handle);
        } else {
            // Need a user gesture to re-request — show the banner
            document.getElementById('reload-banner').style.display = 'flex';
        }
    } catch (e) {
        console.warn('Auto-load themes:', e);
    }
}

// ── "Reload last folder" banner button ─────────────────────
async function reloadLastFolder() {
    if (!storedDirHandle) return;
    try {
        const perm = await storedDirHandle.requestPermission({
            mode: 'read'
        });
        if (perm === 'granted') {
            await loadFromDirHandle(storedDirHandle);
            document.getElementById('reload-banner').style.display = 'none';
        }
    } catch (e) {
        console.error(e);
    }
}

// ── Manual folder picker ────────────────────────────────────
async function loadThemeFolder() {
    if ('showDirectoryPicker' in window) {
        try {
            const dir = await window.showDirectoryPicker({
                mode: 'read'
            });
            storedDirHandle = dir;
            await IDB.set('dirHandle', dir); // persist for next session
            document.getElementById('reload-banner').style.display = 'none';
            const n = await loadFromDirHandle(dir);
            if (!n) alert('No .json files found in that folder.');
        } catch (e) {
            if (e.name !== 'AbortError') console.error(e);
        }
    } else {
        // Fallback: plain file input (no persistence)
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.multiple = true;
        inp.accept = '.json';
        inp.addEventListener('change', async () => {
            for (const file of inp.files) {
                try {
                    const json = JSON.parse(await file.text());
                    json._name = file.name.replace(/\.json$/i, '');
                    const idx = themes.findIndex(x => x._name === json._name);
                    if (idx >= 0) themes[idx] = json;
                    else themes.push(json);
                } catch (e) {
                    console.warn('Skipping', file.name, e);
                }
            }
            renderThemeList();
        });
        inp.click();
    }
}

// ── Render the theme list in the sidebar ───────────────────
function renderThemeList() {
    const list = document.getElementById('theme-list');
    const empty = document.getElementById('theme-empty');
    list.innerHTML = '';

    if (themes.length === 0) {
        if (empty) list.appendChild(empty);
        return;
    }

    for (const theme of themes) {
        const item = document.createElement('div');
        item.className = 'theme-item' + (theme._name === activeThemeName ? ' active' : '');

        const name = document.createElement('span');
        name.className = 'theme-name';
        name.textContent = theme._name;

        const dot = document.createElement('div');
        dot.className = 'theme-dot';
        dot.style.background = theme.background || '#1e1e1e';

        item.append(name, dot); // name LEFT, dot RIGHT
        item.addEventListener('click', () => {
            activeThemeName = theme._name;
            applyTheme(theme);
            renderThemeList();
        });
        list.appendChild(item);
    }
}

// ── Export current theme to JSON ───────────────────────────
function exportCurrentTheme() {
    const name = prompt('Theme name:', activeThemeName || 'my-theme');
    if (!name) return;

    const theme = {
        bracket0: config.colors.bracket0,
        bracket1: config.colors.bracket1,
        bracket2: config.colors.bracket2,
        function: config.colors.function,
        variable: config.colors.variable,
        operator: config.colors.operator,
        semicolon: config.colors.semicolon,
        number: config.colors.number,
        comment: config.colors.comment,
        unknown: config.colors.unknown,
        background: config.colors.background,
    };

    const blob = new Blob([JSON.stringify(theme, null, 2)], {
        type: 'application/json'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name.endsWith('.json') ? name : name + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
}

// OPERATORS
function renderOpChips() {
    const container = document.getElementById('op-chips');
    const opColor = config.colors.operator;
    container.innerHTML = '';
    for (const op of config.operators) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        const code = document.createElement('code');
        code.textContent = op;
        code.style.color = opColor; // inline — always reflects current theme
        const del = document.createElement('button');
        del.className = 'chip-x';
        del.textContent = '×';
        del.title = 'Remove';
        del.onclick = () => removeOp(op);
        chip.append(code, del);
        container.appendChild(chip);
    }
}

function addOp() {
    const inp = document.getElementById('new-op');
    const v = inp.value;
    if (v && !config.operators.includes(v)) {
        config.operators.push(v);
        renderOpChips();
        redraw();
    }
    inp.value = '';
    inp.focus();
}

function removeOp(op) {
    config.operators = config.operators.filter(o => o !== op);
    renderOpChips();
    redraw();
}

// PARENTHESES
// Map group id → the mutable array it controls
const BRACKET_GROUPS = {
    mlopen: {
        arr: () => BRACKETS.ML_OPEN,
        set: v => {
            BRACKETS.ML_OPEN = v;
        }
    },
    mlclose: {
        arr: () => BRACKETS.ML_CLOSE,
        set: v => {
            BRACKETS.ML_CLOSE = v;
        }
    },
    mlpass: {
        arr: () => BRACKETS.ML_PASS,
        set: v => {
            BRACKETS.ML_PASS = v;
        }
    },
    ilopen: {
        arr: () => BRACKETS.IL_OPEN,
        set: v => {
            BRACKETS.IL_OPEN = v;
        }
    },
    ilclose: {
        arr: () => BRACKETS.IL_CLOSE,
        set: v => {
            BRACKETS.IL_CLOSE = v;
        }
    },
};

// Color for bracket chips: level 0/1/2 colors cycle through bracket colors
function bracketChipColor(index) {
    return config.colors[`bracket${index % 3}`];
}

function renderBracketChips() {
    for (const [gid, g] of Object.entries(BRACKET_GROUPS)) {
        const container = document.getElementById(`chips-${gid}`);
        container.innerHTML = '';
        g.arr().forEach((ch, idx) => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            const code = document.createElement('code');
            code.textContent = ch;
            code.style.color = bracketChipColor(idx);
            const del = document.createElement('button');
            del.className = 'chip-x';
            del.textContent = '×';
            del.title = 'Remove';
            del.onclick = () => removeBracket(gid, ch);
            chip.append(code, del);
            container.appendChild(chip);
        });
    }
}

function addBracket(gid) {
    const inp = document.getElementById(`add-${gid}`);
    const v = inp.value.trim();
    if (!v) return;

    const g = BRACKET_GROUPS[gid];
    if (!g.arr().includes(v)) {
        const next = [...g.arr(), v];
        g.set(next);
        renderBracketChips();
        redraw();
    }
    inp.value = '';
    inp.focus();
}

function removeBracket(gid, ch) {
    const g = BRACKET_GROUPS[gid];
    const next = g.arr().filter(c => c !== ch);
    g.set(next);
    renderBracketChips();
    redraw();
}

// RESIZE HANDLE
;
(() => {
    const h = document.getElementById('rh');
    const p = document.getElementById('ed-panel');
    let drag = false,
        sy = 0,
        sh = 0;
    h.addEventListener('mousedown', e => {
        drag = true;
        sy = e.clientY;
        sh = p.offsetHeight;
        h.classList.add('drag');
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!drag) return;
        const newH = Math.max(55, Math.min(window.innerHeight * .8, sh + (sy - e.clientY)));
        p.style.height = newH + 'px';
        redraw();
    });
    document.addEventListener('mouseup', () => {
        if (!drag) return;
        drag = false;
        h.classList.remove('drag');
        document.body.style.userSelect = '';
    });
})();

// SECTION TOGGLE
function tog(hd) {
    hd.classList.toggle('col');
    hd.nextElementSibling.classList.toggle('hid');
}

// INIT
function init() {
    // Sync all color UI controls from config
    const all = {
        ...config.colors,
        background: config.colors.background
    };
    for (const [k, v] of Object.entries(all)) {
        const fill = document.getElementById(`sf-${k}`);
        const pick = document.getElementById(`cp-${k}`);
        const hex = document.getElementById(`hx-${k}`);
        if (fill) fill.style.background = v;
        if (pick) pick.value = v;
        if (hex) hex.value = v;
    }

    renderOpChips();
    renderBracketChips();
    renderThemeList();

    // Reset editor scroll to top so text starts at the top
    const ed = document.getElementById('ed');
    ed.scrollTop = 0;
    ed.setSelectionRange(0, 0);
}

new ResizeObserver(() => redraw()).observe(document.getElementById('cv-wrap'));

document.fonts.ready.then(async () => {
    init();
    redraw();
    await tryAutoLoad(); // attempt to restore last themes folder
});
window.addEventListener('DOMContentLoaded', () => {
    init();
    redraw();
});