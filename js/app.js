import {
    onHex,
    onPick
} from './common/color_utils.js';
import {
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

const btnExport = document.getElementById('btn-export');
const btnLoadThemes = document.getElementById('btn-load-themes')
const btnExportTheme = document.getElementById('btn-export-theme');

const typographyFontSizeElement = document.getElementById('c-fs');
const typographyLineHeightElement = document.getElementById('c-lh');
const typographyLetterSpacingElement = document.getElementById('c-ls');
const typographyPadXElement = document.getElementById('c-px');
const typographyPadYElement = document.getElementById('c-py');

const editorElement = document.getElementById('ed');
const canvasWrapElement = document.getElementById('canvas-wrap');

const editorFontSizeElement = document.getElementById('ed-fs');
const editorResizeHandleElement = document.getElementById('rh');

// Sidebar section collapse
function toggleSection(element) {
    element.classList.toggle('col');
    element.nextElementSibling.classList.toggle('hid');
}

function init() {
    // Button listeners
    btnExport.addEventListener('click', exportCanvas);
    btnLoadThemes.addEventListener('click', loadThemes);
    btnExportTheme.addEventListener('click', exportCurrentTheme);

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
        document.getElementById(`cp-${themeKey}`).addEventListener(
            'input',
            event => onPick(themeKey, event.target.value)
        );
        document.getElementById(`hx-${themeKey}`).addEventListener(
            'input',
            event => onHex(themeKey, event.target.value)
        );
    }

    // Typography inputs
    typographyFontSizeElement.addEventListener('input', onFontSizeConfig);
    typographyLineHeightElement.addEventListener('input', onLineHeightConfig);
    typographyLetterSpacingElement.addEventListener('input', onLetterSpacingConfig);
    typographyPadXElement.addEventListener('input', onPadXConfig);
    typographyPadYElement.addEventListener('input', onPadYConfig);

    // Editor
    editorElement.addEventListener('input', redraw);
    editorElement.scrollTop = 0;
    editorElement.setSelectionRange(0, 0);

    // Editor listeners
    editorFontSizeElement.addEventListener('input', onEditorFontSize);
    editorResizeHandleElement.addEventListener('mousedown', onResize);
    document.addEventListener('mouseup', onEditorMouseUp);
    document.addEventListener('mousemove', onEditorMouseMove);

    // Canvas listeners
    canvasWrapElement.addEventListener('wheel', onZoom, {
        passive: false
    });
    canvasWrapElement.addEventListener('dblclick', onZoomReset);
    canvasWrapElement.addEventListener('mousedown', onPanning);
    document.addEventListener('keydown', onSpace);
    document.addEventListener('keyup', onSpaceRelease);
    document.addEventListener('mousemove', onPanningMove);
    document.addEventListener('mouseup', onPanningRelease);

    renderThemeList();
}

await document.fonts.ready.then(() => {
    init();
    redraw();
});