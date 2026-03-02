const ARITHMETIC = ['+', '-', '%', '*', '**'];
const COMPARISON = ['=', '>', '<'];
const BITWISE = ['&', '|', '^', '~'];
const SPECIAL = ['!', '—', '·', '─'];

export const OPERATORS_SET = Object.freeze(new Set([
    ...ARITHMETIC,
    ...COMPARISON,
    ...BITWISE,
    ...SPECIAL
]));