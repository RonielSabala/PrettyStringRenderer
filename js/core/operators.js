const OPERATORS = Object.freeze([
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
    '&&',
    '||',
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
    '─', // Division
]);

export const SORTED_OPS = Object.freeze([...OPERATORS].sort((a, b) => b.length - a.length));