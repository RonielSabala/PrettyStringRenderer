import { adjustCanvas } from './canvas/controller.js';
import {
    onPanning,
    onPanningMove,
    onPanningRelease,
    onSpace,
    onSpaceRelease,
    onZoom,
    onZoomReset
} from './canvas/controller.js';
import {
    CANVAS_DEFAULTS,
    THEME_KEYS
} from './common/config.js';
import {
    CSS
} from './common/constants/css.js';
import {
    EVENTS
} from './common/constants/events.js';
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
    resolutionBadgeElement,
    sectionBracketColors,
    sectionCanvasColors,
    sectionSyntaxColors,
    typographyFontSizeElement,
    typographyLetterSpacingElement,
    typographyLineHeightElement,
    typographyPadXElement,
    typographyPadYElement
} from './common/elements.js';
import {
    state
} from './common/store.js';
import {
    onHex,
    onPick,
} from './features/color.js';
import {
    initEditorPanel,
    onEditorChange,
    onEditorFontSize,
    onEditorMouseMove,
    onEditorMouseUp,
    onEscapeToCanvas,
    onResize
} from './features/editor.js';
import {
    exportCanvas,
    exportCanvasOnCtrlS
} from './features/export.js';
import {
    exportCurrentTheme,
    loadThemes,
    onThemesFocus
} from './features/themes.js';
import {
    initTypographyPanel,
    onFontSizeConfig,
    onLetterSpacingConfig,
    onLineHeightConfig,
    onPadXConfig,
    onPadYConfig
} from './features/typography.js';
import {
    updateColor
} from './utils/color.js';
import {
    toggleSection
} from './utils/init.js';
import {
    describeResolution
} from './utils/resolution.js';

function initSections() {
    resolutionBadgeElement.textContent = `${describeResolution()} · ${CANVAS_DEFAULTS.aspectRatio}:1`;

    // Hide color sections
    toggleSection(sectionBracketColors);
    toggleSection(sectionSyntaxColors);
    toggleSection(sectionCanvasColors);
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
    for (const [ThemeKey, ThemeValue] of Object.entries(state.colors)) {
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
    editorElement.addEventListener(EVENTS.INPUT, onEditorChange);
    editorFontSizeElement.addEventListener(EVENTS.INPUT, onEditorFontSize);
    editorResizeHandleElement.addEventListener(EVENTS.MOUSE_DOWN, onResize);
    document.addEventListener(EVENTS.MOUSE_UP, onEditorMouseUp);
    document.addEventListener(EVENTS.MOUSE_MOVE, onEditorMouseMove);
    document.addEventListener(EVENTS.KEY_DOWN, onEscapeToCanvas)

    // Canvas
    canvasWrapElement.addEventListener(EVENTS.WHEEL, onZoom, {
        passive: false
    });
    canvasWrapElement.addEventListener(EVENTS.CONTEXT_MENU, (event) => event.preventDefault());
    canvasWrapElement.addEventListener(EVENTS.DBL_CLICK, onZoomReset);
    canvasWrapElement.addEventListener(EVENTS.MOUSE_DOWN, onPanning);
    document.addEventListener(EVENTS.KEY_DOWN, onSpace);
    document.addEventListener(EVENTS.KEY_DOWN, exportCanvasOnCtrlS);
    document.addEventListener(EVENTS.KEY_UP, onSpaceRelease);
    document.addEventListener(EVENTS.MOUSE_MOVE, onPanningMove);
    document.addEventListener(EVENTS.MOUSE_UP, onPanningRelease);
}

await document.fonts.ready.then(() => {
    initSections();
    initTypographyPanel();
    initEditorPanel();
    initListeners();
    onEditorChange();
    adjustCanvas();
});