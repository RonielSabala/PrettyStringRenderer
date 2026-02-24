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

const typographyFontSizeElement = document.getElementById('typography-font-size');
const typographyLineHeightElement = document.getElementById('typography-line-height');
const typographyLetterSpacingElement = document.getElementById('typography-letter-spacing');
const typographyPadXElement = document.getElementById('typography-pad-x');
const typographyPadYElement = document.getElementById('typography-pad-y');

const editorElement = document.getElementById('editor');
const editorFontSizeElement = document.getElementById('editor-font-size');
const editorResizeHandleElement = document.getElementById('resize-handle');

const canvasWrapElement = document.getElementById('canvas-wrap');

function initNumberInput(element, dataContainer) {
    element.value = dataContainer.value;
    element.min = dataContainer.min;
    element.max = dataContainer.max;
    element.step = dataContainer?.step ?? 1;
}

function toggleSection(element) {
    element.classList.toggle('collapsed');
    element.nextElementSibling.classList.toggle('hidden');
}

// Typography elements
initNumberInput(typographyFontSizeElement, CANVAS_DEFAULTS.fontSize)
initNumberInput(typographyLineHeightElement, CANVAS_DEFAULTS.lineHeight)
initNumberInput(typographyLetterSpacingElement, CANVAS_DEFAULTS.letterSpacing)
initNumberInput(typographyPadXElement, CANVAS_DEFAULTS.padX)
initNumberInput(typographyPadYElement, CANVAS_DEFAULTS.padY)

// Editor
initNumberInput(editorFontSizeElement, EDITOR_DEFAULTS.fontSize)
editorElement.scrollTop = 0;
editorElement.setSelectionRange(0, 0);
editorElement.innerHTML = EDITOR_DEFAULTS.content;
editorElement.style.fontSize = `${EDITOR_DEFAULTS.fontSize.value}px`;
editorElement.style.lineHeight = EDITOR_DEFAULTS.lineHeight;
editorElement.style.letterSpacing = EDITOR_DEFAULTS.letterSpacing;
editorElement.style.padding = `${EDITOR_DEFAULTS.padX}px ${EDITOR_DEFAULTS.padY}px`;

function initListeners() {
    // Buttons
    btnExport.addEventListener('click', exportCanvas);
    btnLoadThemes.addEventListener('click', loadThemes);
    btnExportTheme.addEventListener('click', exportCurrentTheme);

    // Collapse sections
    document.querySelectorAll('.section-header').forEach(
        element => element.addEventListener('click', () => toggleSection(element))
    );

    // Apply default theme
    for (const [ThemeKey, ThemeValue] of Object.entries(config.colors)) {
        updateColor(ThemeKey, ThemeValue);
    }

    // Color pickers + hex
    for (const themeKey of THEME_KEYS) {
        document.getElementById(`color-picker-${themeKey}`).addEventListener(
            'input',
            event => onPick(themeKey, event.target.value)
        );
        document.getElementById(`hex-input-${themeKey}`).addEventListener(
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