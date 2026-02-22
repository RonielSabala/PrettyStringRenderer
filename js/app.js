import {
    THEME_KEYS,
    config
} from "./common/config.js";
'use strict';

import {
    doExport,
} from "./controllers/export_controller.js";

import {
    addBracket,
    addOp,
    redraw,
    renderBracketChips,
    renderOpChips,
    updateColor,
} from "./controllers/render_controller.js";

import {
    exportCurrentTheme,
    importThemes,
    renderThemeList
} from "./controllers/themes_controller.js";

import {
    onBgHex,
    onBgPick,
    onHex,
    onPick
} from "./common/color_utils.js";

import {
    onEditorFontSize,
    onTypographyConfig
} from "./controllers/typography_controller.js";

(() => {
    const resizeHandle = document.getElementById('rh');
    const editorPanel = document.getElementById('ed-panel');
    let drag = false,
        sy = 0,
        sh = 0;

    resizeHandle.addEventListener('mousedown', event => {
        drag = true;
        sy = event.clientY;
        sh = editorPanel.offsetHeight;
        resizeHandle.classList.add('drag');
        document.body.style.userSelect = 'none';
        event.preventDefault();
    });

    document.addEventListener('mousemove', event => {
        if (!drag) {
            return;
        }

        const newHeight = Math.max(55, Math.min(window.innerHeight * .8, sh + (sy - event.clientY)));
        editorPanel.style.height = newHeight + 'px';
        redraw();
    });

    document.addEventListener('mouseup', () => {
        if (!drag) {
            return;
        }

        drag = false;
        resizeHandle.classList.remove('drag');
        document.body.style.userSelect = '';
    });
})();

function toggleHeader(header) {
    header.classList.toggle('col');
    header.nextElementSibling.classList.toggle('hid');
}

function init() {
    for (const [key, value] of Object.entries(config.colors)) {
        updateColor(key, value);
    }

    document.getElementById('btn-export').addEventListener('click', doExport);
    document.getElementById('btn-load-themes').addEventListener('click', importThemes);
    document.getElementById('btn-export-theme').addEventListener('click', exportCurrentTheme);
    document.querySelectorAll('.sh').forEach(element => element.addEventListener('click', () => toggleHeader(element)));

    THEME_KEYS.forEach(key => {
        const colorPicker = document.getElementById(`cp-${key}`);
        if (colorPicker) colorPicker.addEventListener('input', e => onPick(key, e.target.value));

        const hexInput = document.getElementById(`hx-${key}`);
        if (hexInput) hexInput.addEventListener('input', e => onHex(key, e.target.value));
    });

    const colorPickerBg = document.getElementById('cp-background');
    if (colorPickerBg) {
        colorPickerBg.addEventListener('input', e => onBgPick(e.target.value));
    }

    const hexInputBg = document.getElementById('hx-background');
    if (hexInputBg) {
        hexInputBg.addEventListener('input', e => onBgHex(e.target.value));
    }

    ['c-fs', 'c-lh', 'c-ls', 'c-px', 'c-py'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', onTypographyConfig);
        }
    });

    const editor = document.getElementById('ed');
    if (editor) {
        editor.scrollTop = 0;
        editor.setSelectionRange(0, 0);
        editor.addEventListener('input', redraw);
    }

    const editorFontSize = document.getElementById('ed-fs');
    if (editorFontSize) {
        editorFontSize.addEventListener('input', onEditorFontSize);
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
    if (editor) {
        editor.scrollTop = 0;
        editor.setSelectionRange(0, 0);
    }
}

new ResizeObserver(() => redraw()).observe(document.getElementById('cv-wrap'));

document.fonts.ready.then(async () => {
    init();
    redraw();
});