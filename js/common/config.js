import _defaults from '../../userData/profile.example.json';
import {
    editorTabsElement
} from './elements.js';

// User profile
const _profile = import.meta.glob('../../userData/profile.json', {
    eager: true
});
const _u = _profile['../../userData/profile.json']?.default ?? {};

// App
export const LINE_BREAK = '\n';
export const SAVE_TIMEOUT_MS = 200;
export const MAX_HEX_INPUT_LENGTH = 7;
export const APP_FONT_VARIANT_LIGATURES = _u.app?.fontVariantLigatures ?? _defaults.app.fontVariantLigatures;

// Typography
const _uTypography = _u.typography ?? {};
export const TYPOGRAPHY_DEFAULTS = {
    fontSize: {
        value: _uTypography.fontSize ?? _defaults.typography.fontSize,
        min: 5,
        max: 300,
    },
    lineHeight: {
        value: _uTypography.lineHeight ?? _defaults.typography.lineHeight,
        min: 0.8,
        max: 4,
        step: 0.01,
    },
    letterSpacing: {
        value: _uTypography.letterSpacing ?? _defaults.typography.letterSpacing,
        min: -10,
        max: 50,
        step: 0.5,
    },
    padX: {
        value: _uTypography.padX ?? _defaults.typography.padX,
        min: 0,
        max: 400,
    },
    padY: {
        value: _uTypography.padY ?? _defaults.typography.padY,
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
    content: _uEditor.content ?? _defaults.editor.content,
    height: _uEditor.height ?? _defaults.editor.height,
    padX: _uEditor.padX ?? _defaults.editor.padX,
    padY: _uEditor.padY ?? _defaults.editor.padY,
    fontSize: {
        value: _uEditor.fontSize ?? _defaults.editor.fontSize,
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
const _canvasWidth = _uCanvas.width ?? _defaults.canvas.width;
const _canvasHeight = _uCanvas.height ?? _defaults.canvas.height;
export const CANVAS_DEFAULTS = {
    zoom: 1,
    panX: 0,
    panY: 0,
    width: _canvasWidth,
    height: _canvasHeight,
    aspectRatio: _canvasWidth / _canvasHeight,
    fitToContent: _uCanvas.fitToContent ?? _defaults.canvas.fitToContent,
    font: _uCanvas.font ?? _defaults.canvas.font,
    fontWeight: _uCanvas.fontWeight ?? _defaults.canvas.fontWeight,
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
export const DEFAULT_EXPORT_IMAGE_FILENAME = _uExport.defaultImageFilename ?? _defaults.export.defaultImageFilename;
export const DEFAULT_EXPORT_THEME_FILENAME = _uExport.defaultThemeFilename ?? _defaults.export.defaultThemeFilename;

// Themes

export const THEMES_EXTENSION = '.json';
export const THEMES_FILE_TYPE = 'file';
export const EXPORT_THEME_PROMPT_MESSAGE = 'Theme name:';
export const THEME_BLOB_TYPE = {
    type: 'application/json'
};

const _theme = _u.theme ?? _defaults.theme;
export const DEFAULT_THEME = Object.freeze(_theme);
export const THEME_KEYS = Object.keys(_theme);
