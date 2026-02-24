// Display constants
const CANVAS_WIDTH = 3120;
const CANVAS_HEIGHT = 780;
const CANVAS_ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

// Movements constants
const CANVAS_MIN_ZOOM = 0.4;
const CANVAS_MAX_ZOOM = 10;
const CANVAS_ZOOM_FACTOR = 1.15;
const CANVAS_PAN_SCROLL_SPEED = 0.5;

// Render constants
const CANVAS_MIN_PIXEL_SCALE = 1;
const CANVAS_MAX_PIXEL_SCALE = 4;
const CANVAS_QUALITY_REDRAW_DEBOUNCE_MS = 120;
const CANVAS_AVAILABLE_MARGIN_OFFSET_PX = 50;

// UI input defaults

const CANVAS_DEFAULTS = {
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

const EDITOR_DEFAULTS = {
    content: String.raw`                                       /        /      *B2 \\
                                       ▏        \(en())    /▕
                                       ▏/ dev; \            ▕
                                       ▏▏ ──── ▕            ▕
                                       \\ solv /            /
/           —**r_(on)ie[l] + saba(la) \
▏/       _ \                          ▕
\\((_)++)  /                          /`,
    fontSize: {
        value: 16,
        min: 8,
        max: 36,
    },
    lineHeight: "auto",
    letterSpacing: "auto",
    padX: 10,
    padY: 10,
};

// UI theme defaults

const DEFAULT_THEME = {
    bracket0: '#569CD6',
    bracket1: '#FFD700',
    bracket2: '#C586C0',
    function: '#DCDCAA',
    variable: '#9CDCFE',
    operator: '#D4D4D4',
    semicolon: '#808080',
    number: '#B5CEA8',
    comment: '#6A9955',
    unknown: '#CE9178',
    background: '#1e1e1e',
};

const THEME_KEYS = Object.keys(DEFAULT_THEME);

// Mutable runtime config consumed by the renderer
const config = {
    fontSize: CANVAS_DEFAULTS.fontSize.value,
    lineHeight: CANVAS_DEFAULTS.lineHeight.value,
    letterSpacing: CANVAS_DEFAULTS.letterSpacing.value,
    padX: CANVAS_DEFAULTS.padX.value,
    padY: CANVAS_DEFAULTS.padY.value,
    colors: {
        ...DEFAULT_THEME
    },
};

export {
    CANVAS_ASPECT_RATIO,
    CANVAS_AVAILABLE_MARGIN_OFFSET_PX,
    CANVAS_DEFAULTS,
    CANVAS_HEIGHT,
    CANVAS_MAX_PIXEL_SCALE,
    CANVAS_MAX_ZOOM,
    CANVAS_MIN_PIXEL_SCALE,
    CANVAS_MIN_ZOOM,
    CANVAS_PAN_SCROLL_SPEED,
    CANVAS_QUALITY_REDRAW_DEBOUNCE_MS,
    CANVAS_WIDTH,
    CANVAS_ZOOM_FACTOR,
    config,
    DEFAULT_THEME,
    EDITOR_DEFAULTS,
    THEME_KEYS
};