// Display constants
export const CANVAS_WIDTH = 3120;
export const CANVAS_HEIGHT = 780;
export const CANVAS_ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

// Movements constants
export const CANVAS_MIN_ZOOM = 0.4;
export const CANVAS_MAX_ZOOM = 10;
export const CANVAS_ZOOM_FACTOR = 1.15;
export const CANVAS_PAN_SCROLL_SPEED = 0.5;

// Render constants
export const CANVAS_MIN_PIXEL_SCALE = 1;
export const CANVAS_MAX_PIXEL_SCALE = 5;
export const CANVAS_QUALITY_REDRAW_DEBOUNCE_MS = 120;
export const CANVAS_AVAILABLE_MARGIN_OFFSET_PX = 50;
export const CANVAS_ASCENT_OFFSET_PX = 8;

// UI input defaults

export const CANVAS_DEFAULTS = {
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

export const DEFAULT_THEME = {
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

export const THEME_KEYS = Object.keys(DEFAULT_THEME);

// Mutable runtime config consumed by the renderer
export const config = {
    fontSize: CANVAS_DEFAULTS.fontSize.value,
    lineHeight: CANVAS_DEFAULTS.lineHeight.value,
    letterSpacing: CANVAS_DEFAULTS.letterSpacing.value,
    padX: CANVAS_DEFAULTS.padX.value,
    padY: CANVAS_DEFAULTS.padY.value,
    colors: {
        ...DEFAULT_THEME
    },
};