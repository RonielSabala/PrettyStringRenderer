'use strict';

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════
const cfg = {
    background: '#1e1e1e',
    fontSize: 85,
    lineHeight: 1.15,
    letterSpacing: 0,
    paddingX: 64,
    paddingY: 4,

    operators: [
        '**', '++', '--',
        '+', '-', '*', '=', '!', '<', '>', '&', '|', '^', '~', '%',
        '—', '·', '_',
    ],

    colors: {
        bracket0: '#569CD6',
        bracket1: '#FFD700',
        bracket2: '#C586C0',
        function: '#DCDCAA',
        variable: '#9CDCFE',
        operator: '#D4D4D4',
        semicolon: '#808080',
        number: '#B5CEA8',
        comment: '#6A9955',
        unknown: '#CE9178',
    },
};

const OUT_W = 3120,
    OUT_H = 780,
    ASPECT = OUT_W / OUT_H;

// ═══════════════════════════════════════════════════════════
// BRACKET SETS  (mutable — controlled by the Parentheses UI)
//
// ML = multi-line: depth persists column-by-column across rows.
// IL = inline:     depth resets to 0 at the start of each row.
//
// ML_OPEN  → color at current col-depth, then col-depth++
// ML_CLOSE → col-depth--, then color at new col-depth
// ML_PASS  → no depth change; color = (col-depth - 1)
//             (sits "inside" the opener above it)
// IL_OPEN  → color at current line-depth, then line-depth++
// IL_CLOSE → line-depth--, then color at new line-depth
// ═══════════════════════════════════════════════════════════
let ML_OPEN = ['/', '▏', '┌'];
let ML_CLOSE = ['\\', '▕', '┘'];
let ML_PASS = ['│', '┐', '└'];
let IL_OPEN = ['(', '[', '{'];
let IL_CLOSE = [')', ']', '}'];

// Fast lookup sets derived from the above arrays
function buildBracketSets() {
    return {
        open: new Set(ML_OPEN),
        close: new Set(ML_CLOSE),
        pass: new Set(ML_PASS),
        ilO: new Set(IL_OPEN),
        ilC: new Set(IL_CLOSE),
    };
}

// ═══════════════════════════════════════════════════════════
// TOKEN TYPES
// ═══════════════════════════════════════════════════════════
const T = {
    BRACKET: 'b',
    OPERATOR: 'op',
    FUNCTION: 'fn',
    VARIABLE: 'va',
    SEMICOLON: 'sc',
    COMMENT: 'co',
    NUMBER: 'nu',
    WS: 'ws',
    UNKNOWN: 'uk',
};

// ═══════════════════════════════════════════════════════════
// TOKENIZER
// ═══════════════════════════════════════════════════════════
function tokenize(text) {
    const lines = text.split('\n');
    const result = [];
    const colML = {}; // column → current ML open-depth
    const sets = buildBracketSets();
    const sortedOps = [...cfg.operators].sort((a, b) => b.length - a.length);

    for (const raw of lines) {
        const toks = [];
        let i = 0,
            n = raw.length,
            ilD = 0;

        while (i < n) {
            const ch = raw[i];

            // Whitespace
            if (ch === ' ' || ch === '\t') {
                let j = i;
                while (j < n && (raw[j] === ' ' || raw[j] === '\t')) j++;
                toks.push({
                    t: T.WS,
                    v: raw.slice(i, j)
                });
                i = j;
                continue;
            }

            // Comment: # to EOL
            if (ch === '#') {
                toks.push({
                    t: T.COMMENT,
                    v: raw.slice(i)
                });
                i = n;
                continue;
            }

            // Divider ─ (U+2500) → operator
            if (ch === '\u2500') {
                let j = i;
                while (j < n && raw[j] === '\u2500') j++;
                toks.push({
                    t: T.OPERATOR,
                    v: raw.slice(i, j)
                });
                i = j;
                continue;
            }

            // ML_OPEN
            if (sets.open.has(ch)) {
                const d = colML[i] ?? 0;
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: d % 3
                });
                colML[i] = d + 1;
                i++;
                continue;
            }

            // ML_CLOSE
            if (sets.close.has(ch)) {
                const d = Math.max(0, (colML[i] ?? 0) - 1);
                colML[i] = d;
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: d % 3
                });
                i++;
                continue;
            }

            // ML_PASS — color = (depth - 1), same as the opener above
            if (sets.pass.has(ch)) {
                const d = colML[i] ?? 0;
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: Math.max(0, d - 1) % 3
                });
                i++;
                continue;
            }

            // IL_OPEN
            if (sets.ilO.has(ch)) {
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: ilD % 3
                });
                ilD++;
                i++;
                continue;
            }

            // IL_CLOSE
            if (sets.ilC.has(ch)) {
                ilD = Math.max(0, ilD - 1);
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: ilD % 3
                });
                i++;
                continue;
            }

            // Operators — greedy longest match
            let hit = false;
            for (const op of sortedOps) {
                if (raw.startsWith(op, i)) {
                    toks.push({
                        t: T.OPERATOR,
                        v: op
                    });
                    i += op.length;
                    hit = true;
                    break;
                }
            }
            if (hit) continue;

            // Semicolon
            if (ch === ';') {
                toks.push({
                    t: T.SEMICOLON,
                    v: ch
                });
                i++;
                continue;
            }

            // Identifier → FUNCTION or VARIABLE
            if (/[a-zA-Z]/.test(ch)) {
                let j = i;
                while (j < n && /[a-zA-Z0-9_]/.test(raw[j])) j++;
                const word = raw.slice(i, j);
                let k = j;
                while (k < n && raw[k] === ' ') k++;
                toks.push({
                    t: raw[k] === '(' ? T.FUNCTION : T.VARIABLE,
                    v: word
                });
                i = j;
                continue;
            }

            // Number
            if (/[0-9]/.test(ch)) {
                let j = i;
                while (j < n && /[0-9.]/.test(raw[j])) j++;
                toks.push({
                    t: T.NUMBER,
                    v: raw.slice(i, j)
                });
                i = j;
                continue;
            }

            toks.push({
                t: T.UNKNOWN,
                v: ch
            });
            i++;
        }
        result.push(toks);
    }
    return result;
}

// ═══════════════════════════════════════════════════════════
// COLOR RESOLVER
// ═══════════════════════════════════════════════════════════
function resolveColor(tok) {
    const c = cfg.colors;
    switch (tok.t) {
        case T.BRACKET:
            return c[`bracket${tok.d}`];
        case T.OPERATOR:
            return c.operator;
        case T.FUNCTION:
            return c.function;
        case T.VARIABLE:
            return c.variable;
        case T.SEMICOLON:
            return c.semicolon;
        case T.COMMENT:
            return c.comment;
        case T.NUMBER:
            return c.number;
        case T.WS:
            return null;
        default:
            return c.unknown;
    }
}

// ═══════════════════════════════════════════════════════════
// RENDERER  (always at OUT_W × OUT_H)
// ═══════════════════════════════════════════════════════════
function render(ctx, lines, W, H) {
    const fs = cfg.fontSize;
    const px0 = cfg.paddingX;
    const py0 = cfg.paddingY;
    const ls = cfg.letterSpacing;

    ctx.fillStyle = cfg.background;
    ctx.fillRect(0, 0, W, H);

    ctx.font = `400 ${fs}px 'Cascadia Code','Courier New',monospace`;
    ctx.textBaseline = 'alphabetic';

    const cw = ctx.measureText('M').width + ls;
    const lhpx = fs * cfg.lineHeight;
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

// ═══════════════════════════════════════════════════════════
// PREVIEW
// ═══════════════════════════════════════════════════════════
let tokenLines = [];

function redraw() {
    tokenLines = tokenize(document.getElementById('ed').value);

    const canvas = document.getElementById('canvas');
    const wrap = document.getElementById('cv-wrap');

    // Canvas always at full output resolution
    canvas.width = OUT_W;
    canvas.height = OUT_H;

    render(canvas.getContext('2d'), tokenLines, OUT_W, OUT_H);

    // CSS display size fits wrap, preserving aspect ratio
    const wW = wrap.clientWidth - 40;
    const wH = wrap.clientHeight - 40;
    let dW = Math.min(wW, wH * ASPECT);
    let dH = dW / ASPECT;
    if (dH > wH) {
        dH = wH;
        dW = dH * ASPECT;
    }
    canvas.style.width = Math.max(1, Math.round(dW)) + 'px';
    canvas.style.height = Math.max(1, Math.round(dH)) + 'px';

    updateZoomInfo();
}

// ═══════════════════════════════════════════════════════════
// ZOOM + PAN
// ═══════════════════════════════════════════════════════════
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
        `${OUT_W}×${OUT_H} · ${(cvZoom * 100).toFixed(0)}%`;
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

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════
function doExport() {
    const mul = parseFloat(
        prompt('Scale multiplier:\n  1  → 3120×780\n  2  → 6240×1560\n  0.5 → 1560×390', '1')
    );
    if (isNaN(mul) || mul <= 0) return;

    const W = Math.round(OUT_W * mul),
        H = Math.round(OUT_H * mul);
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;

    // Scale config measurements for the off-screen canvas
    const s = {
        fs: cfg.fontSize,
        ls: cfg.letterSpacing,
        px: cfg.paddingX,
        py: cfg.paddingY
    };
    cfg.fontSize *= mul;
    cfg.letterSpacing *= mul;
    cfg.paddingX *= mul;
    cfg.paddingY *= mul;
    render(off.getContext('2d'), tokenLines, W, H);
    cfg.fontSize = s.fs;
    cfg.letterSpacing = s.ls;
    cfg.paddingX = s.px;
    cfg.paddingY = s.py;

    off.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `code-art-${W}x${H}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
    }, 'image/png');
}

// ═══════════════════════════════════════════════════════════
// COLOR CONTROLS
// ═══════════════════════════════════════════════════════════
function setColor(key, value, isBg) {
    const fill = document.getElementById(`sf-${key}`);
    const pick = document.getElementById(`cp-${key}`);
    const hex = document.getElementById(`hx-${key}`);
    if (fill) fill.style.background = value;
    if (pick) pick.value = value;
    if (hex) hex.value = value;

    if (isBg) {
        cfg.background = value;
    } else {
        cfg.colors[key] = value;
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

// ═══════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════
function onCfg() {
    cfg.fontSize = parseFloat(document.getElementById('c-fs').value) || 85;
    cfg.lineHeight = parseFloat(document.getElementById('c-lh').value) || 1.15;
    cfg.letterSpacing = parseFloat(document.getElementById('c-ls').value) || 0;
    cfg.paddingX = parseFloat(document.getElementById('c-px').value) || 64;
    cfg.paddingY = parseFloat(document.getElementById('c-py').value) || 4;
    redraw();
}

function onEdit() {
    redraw();
}

function onEdFontSize() {
    const sz = parseFloat(document.getElementById('ed-fs').value) || 16;
    document.getElementById('ed').style.fontSize = sz + 'px';
}

// ═══════════════════════════════════════════════════════════
// THEMES  — loaded exclusively from JSON files
// ═══════════════════════════════════════════════════════════
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
        bracket0: cfg.colors.bracket0,
        bracket1: cfg.colors.bracket1,
        bracket2: cfg.colors.bracket2,
        function: cfg.colors.function,
        variable: cfg.colors.variable,
        operator: cfg.colors.operator,
        semicolon: cfg.colors.semicolon,
        number: cfg.colors.number,
        comment: cfg.colors.comment,
        unknown: cfg.colors.unknown,
        background: cfg.background,
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

// ═══════════════════════════════════════════════════════════
// OPERATORS
// ═══════════════════════════════════════════════════════════
function renderOpChips() {
    const container = document.getElementById('op-chips');
    const opColor = cfg.colors.operator;
    container.innerHTML = '';
    for (const op of cfg.operators) {
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
    if (v && !cfg.operators.includes(v)) {
        cfg.operators.push(v);
        renderOpChips();
        redraw();
    }
    inp.value = '';
    inp.focus();
}

function removeOp(op) {
    cfg.operators = cfg.operators.filter(o => o !== op);
    renderOpChips();
    redraw();
}

// ═══════════════════════════════════════════════════════════
// PARENTHESES
// ═══════════════════════════════════════════════════════════
// Map group id → the mutable array it controls
const BRACKET_GROUPS = {
    mlopen: {
        arr: () => ML_OPEN,
        set: v => {
            ML_OPEN = v;
        }
    },
    mlclose: {
        arr: () => ML_CLOSE,
        set: v => {
            ML_CLOSE = v;
        }
    },
    mlpass: {
        arr: () => ML_PASS,
        set: v => {
            ML_PASS = v;
        }
    },
    ilopen: {
        arr: () => IL_OPEN,
        set: v => {
            IL_OPEN = v;
        }
    },
    ilclose: {
        arr: () => IL_CLOSE,
        set: v => {
            IL_CLOSE = v;
        }
    },
};

// Color for bracket chips: level 0/1/2 colors cycle through bracket colors
function bracketChipColor(index) {
    return cfg.colors[`bracket${index % 3}`];
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

// ═══════════════════════════════════════════════════════════
// RESIZE HANDLE
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// SECTION TOGGLE
// ═══════════════════════════════════════════════════════════
function tog(hd) {
    hd.classList.toggle('col');
    hd.nextElementSibling.classList.toggle('hid');
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
function init() {
    // Sync all color UI controls from cfg
    const all = {
        ...cfg.colors,
        background: cfg.background
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