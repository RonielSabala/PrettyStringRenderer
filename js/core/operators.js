const _ARITHMETIC = ['+', '-', '%', '*', '**'];
const _COMPARISON = ['=', '>', '<'];
const _BITWISE = ['&', '|', '^', '~'];
const _OTHER = ['!', '—', '·', '─'];

export const OPERATORS_SET = Object.freeze(new Set([
    ..._ARITHMETIC,
    ..._COMPARISON,
    ..._BITWISE,
    ..._OTHER
]));
