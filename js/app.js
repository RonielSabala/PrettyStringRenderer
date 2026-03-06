import {
    adjustCanvas,
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
    getElement,
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
    initEditorSection,
    onEditorContentChange,
    onEditorCursorChange,
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
    initThemesSection,
    loadThemes,
    onThemesFocus
} from './features/themes.js';
import {
    initTypographySection,
    onFontSizeConfig,
    onLetterSpacingConfig,
    onLineHeightConfig,
    onPadXConfig,
    onPadYConfig
} from './features/typography.js';
import {
    baseToggleSection,
    toggleSection
} from './utils/init.js';
import {
    isObjectEmpty
} from './utils/parse.js';
import {
    restoreState,
    saveActiveElementIdState
} from './utils/persistence.js';
import {
    describeResolution
} from './utils/resolution.js';

function initSections() {
    resolutionBadgeElement.textContent = `${describeResolution()} · ${CANVAS_DEFAULTS.aspectRatio}:1`;
    let collapsedSectionIds = state.collapsedSectionIds;

    if (isObjectEmpty(collapsedSectionIds)) {
        // Hide these color sections on start
        toggleSection(sectionBracketColors);
        toggleSection(sectionSyntaxColors);
        toggleSection(sectionCanvasColors);
        return;
    }

    for (const [id, toggle] of Object.entries(collapsedSectionIds)) {
        if (toggle) {
            baseToggleSection(getElement(id));
        }
    }

    return;
}

function initListeners() {
    btnExport.addEventListener(EVENTS.CLICK, exportCanvas);

    // Sections
    document.querySelectorAll(`.${CSS.SECTION_HEADER}`).forEach(
        element => element.addEventListener(EVENTS.CLICK, () => toggleSection(element))
    );

    // Theme section
    btnLoadThemes.addEventListener(EVENTS.CLICK, loadThemes);
    btnExportTheme.addEventListener(EVENTS.CLICK, exportCurrentTheme);
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

    // Typography section
    typographyFontSizeElement.addEventListener(EVENTS.INPUT, onFontSizeConfig);
    typographyLineHeightElement.addEventListener(EVENTS.INPUT, onLineHeightConfig);
    typographyLetterSpacingElement.addEventListener(EVENTS.INPUT, onLetterSpacingConfig);
    typographyPadXElement.addEventListener(EVENTS.INPUT, onPadXConfig);
    typographyPadYElement.addEventListener(EVENTS.INPUT, onPadYConfig);

    // Editor
    editorElement.addEventListener(EVENTS.INPUT, onEditorContentChange);
    editorElement.addEventListener(EVENTS.CLICK, onEditorCursorChange);
    editorElement.addEventListener(EVENTS.KEY_UP, onEditorCursorChange);
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

    // Window reload listener
    window.addEventListener(EVENTS.WINDOW_RELOAD, () => {
        state.activeElementId = document.activeElement.id;
        saveActiveElementIdState();
    });
}

document.fonts.ready.then(() => {
    restoreState();
    initSections();
    initThemesSection();
    initTypographySection();
    initEditorSection();
    initListeners();
    adjustCanvas();
    document.getElementById(state.activeElementId)?.focus();
});