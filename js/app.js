import {
    onHex,
    onPick
} from './common/color_utils.js';
import {
    THEME_KEYS,
    config
} from './common/config.js';
import {
    onEditorMouseMove,
    onEditorMouseUp,
    onResize
} from "./controllers/editor_controller.js";
import {
    exportCanvas
} from './controllers/export_controller.js';
import {
    redraw,
    updateColor
} from './controllers/render_controller.js';
import {
    exportCurrentTheme,
    loadThemes,
    renderThemeList
} from './controllers/themes_controller.js';
import {
    onEditorFontSize,
    onFontSizeConfig,
    onLetterSpacingConfig,
    onLineHeightConfig,
    onPadXConfig,
    onPadYConfig
} from './controllers/typography_controller.js';

// Sidebar section collapse
function toggleSection(element) {
    element.classList.toggle('col');
    element.nextElementSibling.classList.toggle('hid');
}

function init() {
    // Button listeners
    document.getElementById('btn-export').addEventListener(
        'click',
        exportCanvas
    );
    document.getElementById('btn-load-themes').addEventListener(
        'click',
        loadThemes
    );
    document.getElementById('btn-export-theme').addEventListener(
        'click',
        exportCurrentTheme
    );

    // Section collapse
    document.querySelectorAll('.sh').forEach(
        element => element.addEventListener('click', () => toggleSection(element))
    );

    // Apply default theme
    for (const [ThemeKey, ThemeValue] of Object.entries(config.colors)) {
        updateColor(ThemeKey, ThemeValue);
    }

    // Color pickers + hex inputs
    for (const themeKey of THEME_KEYS) {
        document.getElementById(`cp-${themeKey}`)?.addEventListener(
            'input',
            event => onPick(themeKey, event.target.value)
        );
        document.getElementById(`hx-${themeKey}`)?.addEventListener(
            'input',
            event => onHex(themeKey, event.target.value)
        );
    }

    // Typography inputs
    document.getElementById('c-fs')?.addEventListener('input', onFontSizeConfig);
    document.getElementById('c-lh')?.addEventListener('input', onLineHeightConfig);
    document.getElementById('c-ls')?.addEventListener('input', onLetterSpacingConfig);
    document.getElementById('c-px')?.addEventListener('input', onPadXConfig);
    document.getElementById('c-py')?.addEventListener('input', onPadYConfig);

    // Editor
    const editor = document.getElementById('ed');
    editor.addEventListener('input', redraw);
    editor.scrollTop = 0;
    editor.setSelectionRange(0, 0);

    // Editor listeners
    document.getElementById('ed-fs')?.addEventListener('input', onEditorFontSize);
    document.getElementById('rh')?.addEventListener('mousedown', onResize);
    document.addEventListener('mouseup', onEditorMouseUp);
    document.addEventListener('mousemove', onEditorMouseMove);

    renderThemeList();
}

// Boot
const canvasWrap = document.getElementById('canvas-wrap');
new ResizeObserver(() => redraw()).observe(canvasWrap);

document.fonts.ready.then(() => {
    init();
    redraw();
});