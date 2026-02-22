const OUT_WIDTH = 3120
const OUT_HEIGHT = 780
const ASPECT_RATIO = OUT_WIDTH / OUT_HEIGHT;
const config = {
    fontSize: 85,
    lineHeight: 1.15,
    letterSpacing: 0,
    canvasPadX: 64,
    canvasPadY: 4,

    operators: [
        '**', '++', '--',
        '+', '-', '*', '=', '!', '<', '>', '&', '|', '^', '~', '%',
        '—', '·', '_',
    ],

    colors: {
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
    },
};

export {
    ASPECT_RATIO,
    config,
    OUT_HEIGHT,
    OUT_WIDTH
};