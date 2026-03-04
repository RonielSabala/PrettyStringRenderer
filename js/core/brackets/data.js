const INLINE_PAIRS = Object.freeze(['()', '[]', '{}']);

export const MULTILINE_BRACKETS = Object.freeze([{
    // Round brackets
    left: {
        top: '/',
        mid: '▏',
        bottom: '\\'
    },
    right: {
        top: '\\',
        mid: '▕',
        bottom: '/'
    }
}, {
    // Square brackets
    left: {
        top: '┌',
        mid: '│',
        bottom: '└'
    },
    right: {
        top: '┐',
        mid: '│',
        bottom: '┘'
    }
}]);

function buildInlineBracketSets() {
    return {
        inlineOpen: new Set(INLINE_PAIRS.map(([open]) => open)),
        inlineClose: new Set(INLINE_PAIRS.map(([, close]) => close)),
    };
}

function buildMultilineBracketChars() {
    return new Set(
        MULTILINE_BRACKETS.flatMap(({
            left,
            right
        }) => [
            ...Object.values(left),
            ...Object.values(right),
        ])
    );
}

export const BRACKET_SETS = Object.freeze(buildInlineBracketSets());
export const ML_BRACKET_CHARS = buildMultilineBracketChars();