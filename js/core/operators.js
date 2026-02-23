const OPERATORS = [
    '=',
    // Arithmetic operators
    '+',
    '-',
    '%',
    '*',
    '**',
    // Prefix and postfix operators
    '++',
    '--',
    // Logical operators
    '!',
    // Comparison operators
    '==',
    '===',
    '>',
    '>=',
    '<=',
    // Bitwise operators
    '&',
    '|',
    '^',
    '~',
    // Pretty string operators
    '—', // Minus
    '·', // Multiplication
    '_', // Division
];

const SORTED_OPS = [...OPERATORS].sort((a, b) => b.length - a.length);

export {
    OPERATORS,
    SORTED_OPS
};