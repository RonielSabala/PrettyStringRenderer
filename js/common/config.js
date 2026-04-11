import _defaultTheme from '../../themes/default.json';
import {
    CSS_FONT_VARIANT_LIGATURES
} from './constants/css.js';
import {
    editorTabsElement
} from './elements.js';

// User profile

const _profile = import.meta.glob('../../user.profile.json', {
    eager: true
});
const _u = _profile['../../user.profile.json']?.default ?? {};

// Defaults

const _DEFAULTS = {
    app: {
        fontVariantLigatures: CSS_FONT_VARIANT_LIGATURES.NONE,
    },
    typography: {
        fontSize: 100,
        lineHeight: 1.15,
        letterSpacing: 0,
        padX: 10,
        padY: 10,
    },
    editor: {
        content: 'Hello world!',
        height: 210,
        fontSize: 20,
        padX: 10,
        padY: 10,
    },
    canvas: {
        width: window.screen.width,
        height: window.screen.height,
        font: 'Cascadia Code',
        fontWeight: 400,
        fitToContent: false,
    },
    export: {
        defaultThemeFilename: 'theme',
        defaultImageFilename: 'canvas',
    },
    theme: _defaultTheme
};

// App

export const LINE_BREAK = '\n';
export const SAVE_TIMEOUT_MS = 200;
export const MAX_HEX_INPUT_LENGTH = 7;
export const APP_FONT_VARIANT_LIGATURES = _u.app?.fontVariantLigatures ?? _DEFAULTS.app.fontVariantLigatures;

// Typography

const _uTypography = _u.typography ?? {};
export const TYPOGRAPHY_DEFAULTS = {
    fontSize: {
        value: _uTypography.fontSize ?? _DEFAULTS.typography.fontSize,
        min: 5,
        max: 300,
    },
    lineHeight: {
        value: _uTypography.lineHeight ?? _DEFAULTS.typography.lineHeight,
        min: 0.8,
        max: 4,
        step: 0.01,
    },
    letterSpacing: {
        value: _uTypography.letterSpacing ?? _DEFAULTS.typography.letterSpacing,
        min: -10,
        max: 50,
        step: 0.5,
    },
    padX: {
        value: _uTypography.padX ?? _DEFAULTS.typography.padX,
        min: 0,
        max: 400,
    },
    padY: {
        value: _uTypography.padY ?? _DEFAULTS.typography.padY,
        min: 0,
        max: 400,
    }
};

// Editor

export const EDITOR_LINE_HEIGHT = 'auto';
export const EDITOR_LETTER_SPACING = 'auto';
export const EDITOR_MAX_HEIGHT_PERCENTAGE = 0.8;
export const EDITOR_MIN_HEIGHT_PX = editorTabsElement.offsetHeight;

const _uEditor = _u.editor ?? {};
export const EDITOR_DEFAULTS = {
    content: _uEditor.content ?? _DEFAULTS.editor.content,
    height: _uEditor.height ?? _DEFAULTS.editor.height,
    padX: _uEditor.padX ?? _DEFAULTS.editor.padX,
    padY: _uEditor.padY ?? _DEFAULTS.editor.padY,
    fontSize: {
        value: _uEditor.fontSize ?? _DEFAULTS.editor.fontSize,
        min: 8,
        max: 36,
    },
};

// Canvas

export const CANVAS_MIN_ZOOM = 0.3;
export const CANVAS_MAX_ZOOM = 10;
export const CANVAS_ZOOM_FACTOR = 1.15;
export const CANVAS_PAN_SCROLL_SPEED = 0.5;
export const CANVAS_MIN_PIXEL_SCALE = 1;
export const CANVAS_MAX_PIXEL_SCALE = 5;
export const CANVAS_VIEWPORT_PADDING_PX = 25;
export const CANVAS_REDRAW_TIMEOUT_MS = 120;

const _uCanvas = _u.canvas ?? {};
const _canvasWidth = _uCanvas.width ?? _DEFAULTS.canvas.width;
const _canvasHeight = _uCanvas.height ?? _DEFAULTS.canvas.height;
export const CANVAS_DEFAULTS = {
    zoom: 1,
    panX: 0,
    panY: 0,
    width: _canvasWidth,
    height: _canvasHeight,
    aspectRatio: _canvasWidth / _canvasHeight,
    fitToContent: _uCanvas.fitToContent ?? _DEFAULTS.canvas.fitToContent,
    font: _uCanvas.font ?? _DEFAULTS.canvas.font,
    fontWeight: _uCanvas.fontWeight ?? _DEFAULTS.canvas.fontWeight,
};

// Export

export const PNG_EXTENSION = '.png';
export const SVG_EXTENSION = '.svg';
export const SVG_NS = 'http://www.w3.org/2000/svg';
export const PNG_BLOB_TYPE = {
    type: 'image/png'
};
export const SVG_BLOB_TYPE = {
    type: 'image/svg+xml'
};
export const DEFAULT_PNG_SCALAR = 1;
export const EXPORT_PNG_PROMPT_MESSAGE = 'Scale multiplier:';
export const EXPORT_PNG_PROMPT_SCALAR_EXAMPLES = [1, 2, 0.5];

const _uExport = _u.export ?? {};
export const DEFAULT_EXPORT_IMAGE_FILENAME = _uExport.defaultImageFilename ?? _DEFAULTS.export.defaultImageFilename;
export const DEFAULT_EXPORT_THEME_FILENAME = _uExport.defaultThemeFilename ?? _DEFAULTS.export.defaultThemeFilename;

// Themes

export const THEMES_EXTENSION = '.json';
export const THEMES_FILE_TYPE = 'file';
export const EXPORT_THEME_PROMPT_MESSAGE = 'Theme name:';
export const THEME_BLOB_TYPE = {
    type: 'application/json'
};

const _theme = _u.theme ?? _DEFAULTS.theme;
export const DEFAULT_THEME = Object.freeze(_theme);
export const THEME_KEYS = Object.keys(_theme);
