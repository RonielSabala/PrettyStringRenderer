import {
    updateColor
} from './common/color_utils.js';
import {
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS,
    THEME_KEYS,
    config
} from './common/config.js';
import {
    CSS
} from './common/css_classes.js';
import {
    btnExport,
    btnExportTheme,
    btnLoadThemes,
    canvasWrapElement,
    editorElement,
    editorFontSizeElement,
    editorResizeHandleElement,
    getColorPickerElement,
    getHexInputElement,
    typographyFontSizeElement,
    typographyLetterSpacingElement,
    typographyLineHeightElement,
    typographyPadXElement,
    typographyPadYElement
} from './common/elements.js';
import {
    EVENTS
} from './common/events.js';
import {
    onPanning,
    onPanningMove,
    onPanningRelease,
    onSpace,
    onSpaceRelease,
    onZoom,
    onZoomReset,
} from './controllers/canvas_controller.js';
import {
    onHex,
    onPick,
} from './controllers/color_controller.js';
import {
    onCanvasFocus,
    onEditorFontSize,
    onEditorInput,
    onEditorMouseMove,
    onEditorMouseUp,
    onResize
} from './controllers/editor_controller.js';
import {
    exportCanvas
} from './controllers/export_controller.js';
import {
    exportCurrentTheme,
    loadThemes,
    onThemesFocus
} from './controllers/themes_controller.js';
import {
    onFontSizeConfig,
    onLetterSpacingConfig,
    onLineHeightConfig,
    onPadXConfig,
    onPadYConfig
} from './controllers/typography_controller.js';

function initNumberInput(element, dataContainer) {
    element.value = dataContainer.value;
    element.min = dataContainer.min;
    element.max = dataContainer.max;
    element.step = dataContainer?.step ?? 1;
}

function toggleSection(element) {
    element.classList.toggle(CSS.COLLAPSED_HEADER);
    element.nextElementSibling.classList.toggle(CSS.HIDDEN_BODY);
}

function initElements() {
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
}

function initListeners() {
    // Buttons
    btnExport.addEventListener(EVENTS.CLICK, exportCanvas);
    btnLoadThemes.addEventListener(EVENTS.CLICK, loadThemes);
    btnExportTheme.addEventListener(EVENTS.CLICK, exportCurrentTheme);

    // Collapse sections
    document.querySelectorAll(`.${CSS.SECTION_HEADER}`).forEach(
        element => element.addEventListener(EVENTS.CLICK, () => toggleSection(element))
    );

    // Apply default theme
    for (const [ThemeKey, ThemeValue] of Object.entries(config.colors)) {
        updateColor(ThemeKey, ThemeValue);
    }

    document.addEventListener(EVENTS.KEY_DOWN, onThemesFocus)

    // Color pickers + hex
    for (const themeKey of THEME_KEYS) {
        getColorPickerElement(themeKey).addEventListener(
            EVENTS.INPUT,
            event => onPick(themeKey, event.target.value)
        );
        getHexInputElement(themeKey).addEventListener(
            EVENTS.INPUT,
            event => onHex(themeKey, event.target.value)
        );
    }

    // Typography
    typographyFontSizeElement.addEventListener(EVENTS.INPUT, onFontSizeConfig);
    typographyLineHeightElement.addEventListener(EVENTS.INPUT, onLineHeightConfig);
    typographyLetterSpacingElement.addEventListener(EVENTS.INPUT, onLetterSpacingConfig);
    typographyPadXElement.addEventListener(EVENTS.INPUT, onPadXConfig);
    typographyPadYElement.addEventListener(EVENTS.INPUT, onPadYConfig);

    // Editor
    editorElement.addEventListener(EVENTS.INPUT, onEditorInput);
    editorFontSizeElement.addEventListener(EVENTS.INPUT, onEditorFontSize);
    editorResizeHandleElement.addEventListener(EVENTS.MOUSE_DOWN, onResize);
    document.addEventListener(EVENTS.MOUSE_UP, onEditorMouseUp);
    document.addEventListener(EVENTS.MOUSE_MOVE, onEditorMouseMove);
    document.addEventListener(EVENTS.KEY_DOWN, onCanvasFocus)

    // Canvas
    canvasWrapElement.addEventListener(EVENTS.WHEEL, onZoom, {
        passive: false
    });
    canvasWrapElement.addEventListener(EVENTS.DBL_CLICK, onZoomReset);
    canvasWrapElement.addEventListener(EVENTS.CONTEXT_MENU, (event) => event.preventDefault());
    document.addEventListener(EVENTS.KEY_DOWN, onSpace);
    document.addEventListener(EVENTS.KEY_UP, onSpaceRelease);
    canvasWrapElement.addEventListener(EVENTS.MOUSE_DOWN, onPanning);
    document.addEventListener(EVENTS.MOUSE_MOVE, onPanningMove);
    document.addEventListener(EVENTS.MOUSE_UP, onPanningRelease);
}

await document.fonts.ready.then(() => {
    initElements();
    initListeners();
    onEditorInput();
});