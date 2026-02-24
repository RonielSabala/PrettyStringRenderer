import {
    onHex,
    onPick
} from './common/color_utils.js';
import {
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS,
    THEME_KEYS,
    config
} from './common/config.js';
import {
    onPanning,
    onPanningMove,
    onPanningRelease,
    onSpace,
    onSpaceRelease,
    onZoom,
    onZoomReset
} from "./controllers/canvas_controller.js";
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
    loadThemes
} from './controllers/themes_controller.js';
import {
    onEditorFontSize,
    onFontSizeConfig,
    onLetterSpacingConfig,
    onLineHeightConfig,
    onPadXConfig,
    onPadYConfig
} from './controllers/typography_controller.js';

// App elements

const btnExport = document.getElementById('btn-export');
const btnLoadThemes = document.getElementById('btn-load-themes')
const btnExportTheme = document.getElementById('btn-export-theme');

const typographyFontSizeElement = document.getElementById('c-fs');
const typographyLineHeightElement = document.getElementById('c-lh');
const typographyLetterSpacingElement = document.getElementById('c-ls');
const typographyPadXElement = document.getElementById('c-px');
const typographyPadYElement = document.getElementById('c-py');

const editorElement = document.getElementById('ed');
const editorFontSizeElement = document.getElementById('ed-fs');
const editorResizeHandleElement = document.getElementById('rh');

const canvasWrapElement = document.getElementById('canvas-wrap');

// Typography elements
typographyFontSizeElement.value = CANVAS_DEFAULTS.fontSize;
typographyLineHeightElement.value = CANVAS_DEFAULTS.lineHeight;
typographyLetterSpacingElement.value = CANVAS_DEFAULTS.letterSpacing;
typographyPadXElement.value = CANVAS_DEFAULTS.padX;
typographyPadYElement.value = CANVAS_DEFAULTS.padY;

// Editor
editorFontSizeElement.value = EDITOR_DEFAULTS.fontSize;
editorElement.scrollTop = 0;
editorElement.setSelectionRange(0, 0);
editorElement.innerHTML = EDITOR_DEFAULTS.text;
editorElement.style.fontSize = `${EDITOR_DEFAULTS.fontSize}px`;
editorElement.style.lineHeight = EDITOR_DEFAULTS.lineHeight;
editorElement.style.letterSpacing = EDITOR_DEFAULTS.letterSpacing;
editorElement.style.padding = `${EDITOR_DEFAULTS.padX}px ${EDITOR_DEFAULTS.padY}px`;

// Sidebar section collapse
function toggleSection(element) {
    element.classList.toggle('col');
    element.nextElementSibling.classList.toggle('hid');
}

function initListeners() {
    // Buttons
    btnExport.addEventListener('click', exportCanvas);
    btnLoadThemes.addEventListener('click', loadThemes);
    btnExportTheme.addEventListener('click', exportCurrentTheme);

    // Collapse sections
    document.querySelectorAll('.sh').forEach(
        element => element.addEventListener('click', () => toggleSection(element))
    );

    // Apply default theme
    for (const [ThemeKey, ThemeValue] of Object.entries(config.colors)) {
        updateColor(ThemeKey, ThemeValue);
    }

    // Color pickers + hex
    for (const themeKey of THEME_KEYS) {
        document.getElementById(`cp-${themeKey}`).addEventListener(
            'input',
            event => onPick(themeKey, event.target.value)
        );
        document.getElementById(`hx-${themeKey}`).addEventListener(
            'input',
            event => onHex(themeKey, event.target.value)
        );
    }

    // Typography
    typographyFontSizeElement.addEventListener('input', onFontSizeConfig);
    typographyLineHeightElement.addEventListener('input', onLineHeightConfig);
    typographyLetterSpacingElement.addEventListener('input', onLetterSpacingConfig);
    typographyPadXElement.addEventListener('input', onPadXConfig);
    typographyPadYElement.addEventListener('input', onPadYConfig);

    // Editor
    editorElement.addEventListener('input', redraw);
    editorFontSizeElement.addEventListener('input', onEditorFontSize);
    editorResizeHandleElement.addEventListener('mousedown', onResize);
    document.addEventListener('mouseup', onEditorMouseUp);
    document.addEventListener('mousemove', onEditorMouseMove);

    // Canvas
    canvasWrapElement.addEventListener('wheel', onZoom, {
        passive: false
    });
    canvasWrapElement.addEventListener('dblclick', onZoomReset);
    canvasWrapElement.addEventListener('mousedown', onPanning);
    document.addEventListener('keydown', onSpace);
    document.addEventListener('keyup', onSpaceRelease);
    document.addEventListener('mousemove', onPanningMove);
    document.addEventListener('mouseup', onPanningRelease);
}

await document.fonts.ready.then(() => {
    initListeners();
    redraw();
});