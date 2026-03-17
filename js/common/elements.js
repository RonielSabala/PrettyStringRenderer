import {
    CSS
} from "./constants/css";

export function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element #${id} not found`);
    }

    return element;
}

// Header section
export const resetButtonElement = getElement('btn-reset');
export const btnExport = getElement('btn-export');
export const resolutionBadgeElement = getElement('header-badge');

// Theme section
export const btnLoadThemes = getElement('btn-load-themes')
export const btnExportTheme = getElement('btn-export-theme');
export const emptyThemeElement = getElement('theme-empty');
export const themeListElement = getElement('theme-list');

// Sections
export const sectionBracketColors = getElement('section-bracket-colors');
export const sectionSyntaxColors = getElement('section-syntax-colors');
export const sectionCanvasColors = getElement('section-canvas-colors');
export const sectionTypography = getElement('section-typography');

// Section headers
export const sectionHeaderBracketColors = getElement('section-header-bracket-colors');
export const sectionHeaderSyntaxColors = getElement('section-header-syntax-colors');
export const sectionHeaderCanvasColors = getElement('section-header-canvas-colors');

// Editor
export const editorResizeHandleElement = getElement('editor-resize-handle');
export const editorTabsElement = getElement('editor-tabs');
export const editorStatusElement = getElement('editor-status');
export const editorPanelElement = getElement('editor-panel');
export const editorFontSizeElement = getElement('editor-font-size');
export const editorElement = getElement('editor');

// Canvas
export const canvasWrapElement = getElement('canvas-wrap');
export const canvasInnerElement = getElement('canvas-inner');
export const canvasElement = getElement('canvas');
export const fitToContentElement = getElement('editor-fit-to-content');

// Export dialog
export const exportDialogElement = getElement('dialog-export');
export const btnExportPNG = getElement('btn-export-png');
export const btnExportSVG = getElement('btn-export-svg');

// Elements to exclude from automatic focus during application reload
export const RELOAD_FOCUS_EXCLUSIONS = Object.freeze([
    canvasWrapElement,
    resetButtonElement,
    btnExport
]);

// Color input getters

export function getSwatchFillElement(themeKey) {
    return getElement(`${CSS.SWATCH_FILL}-${themeKey}`);
}

export function getColorPickerElement(themeKey) {
    return getElement(`${CSS.COLOR_PICKER}-${themeKey}`);
}

export function getHexInputElement(themeKey) {
    return getElement(`${CSS.HEX_INPUT}-${themeKey}`);
}