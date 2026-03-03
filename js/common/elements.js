function _getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element #${id} not found`);
    }

    return element;
}

// Header section
export const btnExport = _getElement('btn-export');
export const resolutionBadgeElement = _getElement('header-badge');

// Theme section
export const btnLoadThemes = _getElement('btn-load-themes')
export const btnExportTheme = _getElement('btn-export-theme');
export const emptyThemeElement = _getElement('theme-empty');
export const themeListElement = _getElement('theme-list');

// Sections
export const sectionBracketColors = _getElement('section-bracket-colors');
export const sectionSyntaxColors = _getElement('section-syntax-colors');
export const sectionCanvasColors = _getElement('section-canvas-colors');

// Typography section
export const typographyFontSizeElement = _getElement('typography-font-size');
export const typographyLineHeightElement = _getElement('typography-line-height');
export const typographyLetterSpacingElement = _getElement('typography-letter-spacing');
export const typographyPadXElement = _getElement('typography-pad-x');
export const typographyPadYElement = _getElement('typography-pad-y');

// Editor
export const editorResizeHandleElement = _getElement('editor-resize-handle');
export const editorPanelElement = _getElement('editor-panel');
export const editorFontSizeElement = _getElement('editor-font-size');
export const editorStatusElement = _getElement('editor-status');
export const editorElement = _getElement('editor');

// Canvas
export const canvasWrapElement = _getElement('canvas-wrap');
export const canvasInnerElement = _getElement('canvas-inner');
export const canvasElement = _getElement('canvas');

// Color input getters

export function getSwatchFillElement(themeKey) {
    return _getElement(`swatch-fill-${themeKey}`);
}

export function getColorPickerElement(themeKey) {
    return _getElement(`color-picker-${themeKey}`);
}

export function getHexInputElement(themeKey) {
    return _getElement(`hex-input-${themeKey}`);
}