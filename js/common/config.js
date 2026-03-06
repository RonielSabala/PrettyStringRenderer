import {
    editorTabsElement
} from "./elements.js";

export const LINE_BREAK = '\n';
export const SAVE_TIMEOUT_MS = 200;

// Editor constants
export const EDITOR_MIN_HEIGHT_PX = editorTabsElement.offsetHeight;
export const EDITOR_MAX_HEIGHT_PERCENTAGE = 0.8;

// Canvas movement constants
export const CANVAS_MIN_ZOOM = 0.3;
export const CANVAS_MAX_ZOOM = 10;
export const CANVAS_ZOOM_FACTOR = 1.15;
export const CANVAS_PAN_SCROLL_SPEED = 0.5;

// Canvas render constants
export const CANVAS_FONT = 'Cascadia Code';
export const CANVAS_FONT_WEIGHT = 400;
export const CANVAS_FONT_REFERENCE_GLYPH = 'M';
export const CANVAS_ASCENT_CORRECTION = 9 / 100; // fontSize=100 needs 9 extra pixels so that padY=0 is congruent

// Canvas buffer constants
export const CANVAS_CONTEXT_TYPE = '2d';
export const CANVAS_MIN_PIXEL_SCALE = 1;
export const CANVAS_MAX_PIXEL_SCALE = 5;
export const CANVAS_VIEWPORT_PADDING_PX = 50;
export const CANVAS_QUALITY_REDRAW_DEBOUNCE_MS = 120;

// Theme constants
export const EXPORT_THEME_PROMPT_MESSAGE = 'Theme name:';
export const DEFAULT_EXPORT_THEME_FILENAME = 'my-theme';
export const THEMES_EXTENSION = '.json';
export const THEMES_FILE_TYPE = 'file';
export const THEME_BLOB_TYPE = {
    type: 'application/json'
};

// Image constants
export const EXPORT_IMAGE_PROMPT_MESSAGE = 'Scale multiplier:';
export const EXPORT_IMAGE_PROMPT_SCALAR_EXAMPLES = [1, 2, 0.5];
export const DEFAULT_EXPORT_SCALAR = 1;
export const DEFAULT_EXPORT_IMAGE_FILENAME = 'pretty-string';
export const IMAGES_EXTENSION = '.png';
export const IMAGE_BLOB_TYPE = {
    type: 'image/png'
};

// UI defaults

export const TYPOGRAPHY_DEFAULTS = {
    fontSize: {
        value: 85,
        min: 5,
        max: 300,
    },
    lineHeight: {
        value: 1.15,
        min: 0.8,
        max: 4,
        step: 0.01,
    },
    letterSpacing: {
        value: 0,
        min: -10,
        max: 50,
        step: 0.5,
    },
    padX: {
        value: 64,
        min: 0,
        max: 400,
    },
    padY: {
        value: 4,
        min: 0,
        max: 400,
    },
};

export const EDITOR_DEFAULTS = {
    content: String.raw`                                       /        /      *B2 \\
                                       ▏        \(en())    /▕
              # Software Developer     ▏/ dev; \            ▕
                                       ▏▏ ──── ▕            ▕
                                       \\ solv /            /
/           —**r_(on)ie[l] + saba(la) \
▏/       _ \                          ▕
\\((_)++)  /                          /`,
    height: 210,
    fontSize: {
        value: 16,
        min: 8,
        max: 36,
    },
    lineHeight: 'auto',
    letterSpacing: 'auto',
    padX: 10,
    padY: 10,
};

const canvasWidth = 3120;
const canvasHeight = 780;
export const CANVAS_DEFAULTS = {
    zoom: 1,
    panX: 0,
    panY: 0,
    width: canvasWidth,
    height: canvasHeight,
    aspectRatio: canvasWidth / canvasHeight,
};

// Default pre-loaded UI theme

const _DEFAULT_BRACKET_COLORS = ['#569CD6', '#FFD700', '#C586C0'];
export const BRACKET_COLOR_PREFIX = 'bracket';
export const BRACKET_COLORS_COUNT = _DEFAULT_BRACKET_COLORS.length;

export const DEFAULT_THEME = {
    ...Object.fromEntries(
        _DEFAULT_BRACKET_COLORS.map((color, i) => [`${BRACKET_COLOR_PREFIX}${i}`, color])
    ),
    function: '#DCDCAA',
    variable: '#9CDCFE',
    operator: '#D4D4D4',
    semicolon: '#808080',
    number: '#B5CEA8',
    comment: '#6A9955',
    unknown: '#CE9178',
    background: '#1e1e1e',
};

export const THEME_KEYS = Object.keys(DEFAULT_THEME);