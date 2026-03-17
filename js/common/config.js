import _defaultTheme from '../../themes/default.json';
import {
    CSS_FONT_VARIANT_LIGATURES
} from './constants/css.js';
import {
    editorTabsElement
} from './elements.js';

const userProfile = import.meta.glob('../../user.profile.json', {
    eager: true
});
const _u = userProfile['../../user.profile.json']?.default || {};

// App constants
export const LINE_BREAK = '\n';
export const SAVE_TIMEOUT_MS = 200;
export const MAX_HEX_INPUT_LENGTH = 7;
export const APP_FONT_VARIANT_LIGATURES = _u.app?.fontVariantLigatures ?? CSS_FONT_VARIANT_LIGATURES.NONE;

// Editor constants
export const EDITOR_MIN_HEIGHT_PX = editorTabsElement.offsetHeight;
export const EDITOR_MAX_HEIGHT_PERCENTAGE = 0.8;

// Canvas movement constants
export const CANVAS_MIN_ZOOM = 0.3;
export const CANVAS_MAX_ZOOM = 10;
export const CANVAS_ZOOM_FACTOR = 1.15;
export const CANVAS_PAN_SCROLL_SPEED = 0.5;

// Canvas buffer constants
export const CANVAS_MIN_PIXEL_SCALE = 1;
export const CANVAS_MAX_PIXEL_SCALE = 5;
export const CANVAS_VIEWPORT_PADDING_PX = 25;
export const CANVAS_QUALITY_REDRAW_TIMEOUT_MS = 120;

// Themes constants
const _uExport = _u.export;
export const EXPORT_THEME_PROMPT_MESSAGE = 'Theme name:';
export const DEFAULT_EXPORT_THEME_FILENAME = _uExport?.defaultThemeFilename ?? 'theme';
export const THEMES_EXTENSION = '.json';
export const THEMES_FILE_TYPE = 'file';
export const THEME_BLOB_TYPE = {
    type: 'application/json'
};

// Canvas export constants
export const DEFAULT_EXPORT_IMAGE_FILENAME = _uExport?.defaultImageFilename ?? 'canvas';

// PNG constants
export const PNG_EXTENSION = '.png';
export const DEFAULT_PNG_SCALAR = 1;
export const EXPORT_PNG_PROMPT_MESSAGE = 'Scale multiplier:';
export const EXPORT_PNG_PROMPT_SCALAR_EXAMPLES = [1, 2, 0.5];
export const PNG_BLOB_TYPE = {
    type: 'image/png'
};

// SVG constants
export const SVG_NS = 'http://www.w3.org/2000/svg';
export const SVG_EXTENSION = '.svg';
export const SVG_BLOB_TYPE = {
    type: 'image/svg+xml'
};

// UI defaults

// Typography
const _uTypography = _u.typography;
export const TYPOGRAPHY_DEFAULTS = {
    fontSize: {
        value: _uTypography?.fontSize ?? 100,
        min: 5,
        max: 300,
    },
    lineHeight: {
        value: _uTypography?.lineHeight ?? 1.15,
        min: 0.8,
        max: 4,
        step: 0.01,
    },
    letterSpacing: {
        value: _uTypography?.letterSpacing ?? 0,
        min: -10,
        max: 50,
        step: 0.5,
    },
    padX: {
        value: _uTypography?.padX ?? 10,
        min: 0,
        max: 400,
    },
    padY: {
        value: _uTypography?.padY ?? 10,
        min: 0,
        max: 400,
    },
};

// Editor
const _uEditor = _u.editor;
export const EDITOR_DEFAULTS = {
    content: _uEditor?.content ?? 'Hello world!',
    height: _uEditor?.height ?? 210,
    fontSize: {
        value: _uEditor?.fontSize ?? 20,
        min: 8,
        max: 36,
    },
    lineHeight: 'auto',
    letterSpacing: 'auto',
    padX: _uEditor?.padX ?? 10,
    padY: _uEditor?.padY ?? 10,
};

// Canvas
const _uCanvas = _u.canvas;
const _canvasWidth = _uCanvas?.width ?? window.screen.width;
const _canvasHeight = _uCanvas?.height ?? window.screen.height;
export const CANVAS_DEFAULTS = {
    zoom: 1,
    panX: 0,
    panY: 0,
    width: _canvasWidth,
    height: _canvasHeight,
    aspectRatio: _canvasWidth / _canvasHeight,
    fitToContent: _uCanvas?.fitToContent ?? false,
    font: _uCanvas?.font ?? 'Cascadia Code',
    fontWeight: _uCanvas?.fontWeight ?? 400,
};

// Theme
const _theme = _u.theme ?? _defaultTheme;
export const THEME_KEYS = Object.keys(_theme);
export const DEFAULT_THEME = Object.freeze(_theme);