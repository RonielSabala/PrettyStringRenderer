const OUT_WIDTH = 3120
const OUT_HEIGHT = 780
const ASPECT_RATIO = OUT_WIDTH / OUT_HEIGHT;
const COLOR_KEYS = [
    'bracket0',
    'bracket1',
    'bracket2',
    'function',
    'variable',
    'operator',
    'semicolon',
    'number',
    'comment',
    'unknown'
];
const DEFAULT_COLORS = [
    '#569CD6',
    '#FFD700',
    '#C586C0',
    '#DCDCAA',
    '#9CDCFE',
    '#D4D4D4',
    '#808080',
    '#B5CEA8',
    '#6A9955',
    '#CE9178',
    '#1e1e1e',
]
const editorConfig = {
    fontSize: 16,
}
const canvasConfig = {
    fontSize: 85,
    lineHeight: 1.15,
    letterSpacing: 0,
    padX: 64,
    padY: 4,
}
const config = {
    fontSize: canvasConfig.fontSize,
    lineHeight: canvasConfig.lineHeight,
    letterSpacing: canvasConfig.letterSpacing,
    canvasPadX: canvasConfig.padX,
    canvasPadY: canvasConfig.padY,

    operators: [
        '**', '++', '--',
        '+', '-', '*', '=', '!', '<', '>', '&', '|', '^', '~', '%',
        '—', '·', '_',
    ],

    colors: Object.fromEntries(COLOR_KEYS.map((key, index) => [key, DEFAULT_COLORS[index]])),
};

export {
    ASPECT_RATIO,
    canvasConfig,
    COLOR_KEYS,
    config,
    editorConfig,
    OUT_HEIGHT,
    OUT_WIDTH
};