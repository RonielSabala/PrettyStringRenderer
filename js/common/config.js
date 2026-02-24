// Canvas constants
const CANVAS_WIDTH = 3120;
const CANVAS_HEIGHT = 780;
const CANVAS_ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

// Render constants
const CANVAS_MIN_PIXEL_SCALE = 1;
const CANVAS_MAX_PIXEL_SCALE = 4;
const CANVAS_QUALITY_REDRAW_DEBOUNCE_MS = 120;
const CANVAS_AVAILABLE_MARGIN_OFFSET_PX = 50;

// UI config defaults

const CANVAS_DEFAULTS = {
    fontSize: 85,
    lineHeight: 1.15,
    letterSpacing: 0,
    padX: 64,
    padY: 4,
};

const EDITOR_DEFAULTS = {
    text: String.raw`                                       /        /      *B2 \\
                                       ▏        \(en())    /▕
                                       ▏/ dev; \            ▕
                                       ▏▏ ──── ▕            ▕
                                       \\ solv /            /
/           —**r_(on)ie[l] + saba(la) \
▏/       _ \                          ▕
\\((_)++)  /                          /`,
    fontSize: 16,
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
    fontSize: CANVAS_DEFAULTS.fontSize,
    lineHeight: CANVAS_DEFAULTS.lineHeight,
    letterSpacing: CANVAS_DEFAULTS.letterSpacing,
    padX: CANVAS_DEFAULTS.padX,
    padY: CANVAS_DEFAULTS.padY,
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
    CANVAS_MIN_PIXEL_SCALE,
    CANVAS_QUALITY_REDRAW_DEBOUNCE_MS,
    CANVAS_WIDTH,
    config,
    DEFAULT_THEME,
    EDITOR_DEFAULTS,
    THEME_KEYS
};