import {
    config
} from "./config.js";
'use strict';

import {
    doExport,
} from "./export_controller.js";

import {
    addBracket,
    addOp,
    redraw,
    renderBracketChips,
    renderOpChips,
} from "./render_controller.js";

import {
    exportCurrentTheme,
    importThemes,
    renderThemeList
} from "./themes_controller.js";

import {
    onBgHex,
    onBgPick,
    onHex,
    onPick
} from "./color_utils.js";

import {
    onEditorFontSize,
    onTypographyConfig
} from "./typography_controller.js";

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

    for (const [k, v] of Object.entries(config.colors)) {
        const fill = document.getElementById(`sf-${k}`);
        if (fill) {
            fill.style.background = v;
        }

        const pick = document.getElementById(`cp-${k}`);
        if (pick) {
            pick.value = v;
        }

        const hex = document.getElementById(`hx-${k}`);
        if (hex) {
            hex.value = v;
        }
    }

    // Attach event listeners for controls
    document.getElementById('btn-export').addEventListener('click', doExport);
    document.getElementById('btn-load-themes').addEventListener('click', importThemes);
    document.getElementById('btn-export-theme').addEventListener('click', exportCurrentTheme);
    document.querySelectorAll('.sh').forEach(el => el.addEventListener('click', () => tog(el)));

    const colorKeys = [
        'bracket0',
        'bracket1',
        'bracket2',
        'function',
        'variable',
        'operator',
        'semicolon',
        'number',
        'comment',
        'unknown'
    ];

    colorKeys.forEach(key => {
        const cp = document.getElementById(`cp-${key}`);
        if (cp) cp.addEventListener('input', e => onPick(key, e.target.value));

        const hx = document.getElementById(`hx-${key}`);
        if (hx) hx.addEventListener('input', e => onHex(key, e.target.value));
    });

    const cpbg = document.getElementById('cp-background');
    if (cpbg) {
        cpbg.addEventListener('input', e => onBgPick(e.target.value));
    }

    const hxbg = document.getElementById('hx-background');
    if (hxbg) {
        hxbg.addEventListener('input', e => onBgHex(e.target.value));
    }

    ['c-fs', 'c-lh', 'c-ls', 'c-px', 'c-py'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', onTypographyConfig);
        }
    });

    const ed = document.getElementById('ed');
    if (ed) {
        ed.scrollTop = 0;
        ed.setSelectionRange(0, 0);
        ed.addEventListener('input', redraw);
    }

    const edfs = document.getElementById('ed-fs');
    if (edfs) {
        edfs.addEventListener('input', onEditorFontSize);
    }

    const newOp = document.getElementById('new-op');
    if (newOp) newOp.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            addOp();
        }
    });

    const btnAddOp = document.getElementById('btn-add-op');
    if (btnAddOp) {
        btnAddOp.addEventListener('click', addOp);
    }

    ['mlopen', 'mlclose', 'mlpass', 'ilopen', 'ilclose'].forEach(groupId => {
        const btn = document.getElementById(`btn-add-${groupId}`);
        if (btn) {
            btn.addEventListener('click', () => addBracket(groupId));
        }

        const input = document.getElementById(`add-${groupId}`);
        if (input) input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                addBracket(groupId);
            }
        });
    });

    renderOpChips();
    renderBracketChips();
    renderThemeList();

    // Reset editor scroll to top so text starts at the top
    if (ed) {
        ed.scrollTop = 0;
        ed.setSelectionRange(0, 0);
    }
}

new ResizeObserver(() => redraw()).observe(document.getElementById('cv-wrap'));

document.fonts.ready.then(async () => {
    init();
    redraw();
});