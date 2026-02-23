const CANVAS_WIDTH = 3120;
const CANVAS_HEIGHT = 780;
const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

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

const CANVAS_DEFAULTS = {
    fontSize: 85,
    lineHeight: 1.15,
    letterSpacing: 0,
    padX: 64,
    padY: 4,
};

const EDITOR_DEFAULTS = {
    fontSize: 16,
};

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
    ASPECT_RATIO,
    CANVAS_DEFAULTS,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    config,
    DEFAULT_THEME,
    EDITOR_DEFAULTS,
    THEME_KEYS
};