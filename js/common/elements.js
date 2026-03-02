// Header section
export const btnExport = document.getElementById('btn-export');
export const headerBadgeElement = document.getElementById('header-badge');

// Theme section
export const btnLoadThemes = document.getElementById('btn-load-themes')
export const btnExportTheme = document.getElementById('btn-export-theme');
export const emptyThemeElement = document.getElementById('theme-empty');
export const themeListElement = document.getElementById('theme-list');

// Typography section
export const typographyFontSizeElement = document.getElementById('typography-font-size');
export const typographyLineHeightElement = document.getElementById('typography-line-height');
export const typographyLetterSpacingElement = document.getElementById('typography-letter-spacing');
export const typographyPadXElement = document.getElementById('typography-pad-x');
export const typographyPadYElement = document.getElementById('typography-pad-y');

// Editor
export const editorResizeHandleElement = document.getElementById('editor-resize-handle');
export const editorPanelElement = document.getElementById('editor-panel');
export const editorFontSizeElement = document.getElementById('editor-font-size');
export const editorStatusElement = document.getElementById('editor-status');
export const editorElement = document.getElementById('editor');

// Canvas
export const canvasWrapElement = document.getElementById('canvas-wrap');
export const canvasInnerElement = document.getElementById('canvas-inner');
export const canvasElement = document.getElementById('canvas');

// Color input getters

export function getSwatchFillElement(themeKey) {
    return document.getElementById(`swatch-fill-${themeKey}`);
}

export function getColorPickerElement(themeKey) {
    return document.getElementById(`color-picker-${themeKey}`);
}

export function getHexInputElement(themeKey) {
    return document.getElementById(`hex-input-${themeKey}`);
}