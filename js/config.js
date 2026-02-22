export const cfg = {
    OUT_WIDTH: 3120,
    OUT_HEIGHT: 780,

    fontSize: 85,
    lineHeight: 1.15,
    letterSpacing: 0,
    paddingX: 64,
    paddingY: 4,

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

export const ASPECT_RATIO = cfg.OUT_WIDTH / cfg.OUT_HEIGHT;