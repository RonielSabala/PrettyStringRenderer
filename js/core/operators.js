const ARITHMETIC = ['+', '-', '%', '*', '**'];
const COMPARISON = ['=', '>', '<'];
const BITWISE = ['&', '|', '^', '~'];
const SPECIAL = ['!', '—', '·', '─'];

export const OPERATORS = [
    ...ARITHMETIC,
    ...COMPARISON,
    ...BITWISE,
    ...SPECIAL
];