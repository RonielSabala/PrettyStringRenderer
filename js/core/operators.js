const ARITHMETIC = ['+', '-', '%', '*', '**'];
const LOGICAL = ['!', '&&', '||'];
const COMPARISON = ['=', '==', '===', '>', '>=', '<='];
const BITWISE = ['&', '|', '^', '~'];
const SPECIAL = ['++', '--', '—', '·', '─'];

const ALL_OPERATORS = [
    ...ARITHMETIC,
    ...LOGICAL,
    ...COMPARISON,
    ...BITWISE,
    ...SPECIAL
];

/**
 * Sorted by length descending to ensure the tokenizer matches 
 * the longest possible operator first.
 */
export const SORTED_OPS = Object.freeze(
    [...ALL_OPERATORS].sort((a, b) => b.length - a.length)
);