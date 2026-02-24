// IL = inline
// ML = multi-line
export const BRACKET_SETS = Object.freeze({
    open: new Set(['/', '▏', '┌']),
    close: new Set(['\\', '▕', '┘']),
    pass: new Set(['│', '┐', '└']),
    ilO: new Set(['(', '[', '{']),
    ilC: new Set([')', ']', '}']),
});