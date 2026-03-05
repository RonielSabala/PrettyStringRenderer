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
    return Object.freeze({
        inlineOpen: new Set(INLINE_PAIRS.map(([open]) => open)),
        inlineClose: new Set(INLINE_PAIRS.map(([, close]) => close)),
        multilineOpen: new Set(
            MULTILINE_BRACKETS.flatMap(({
                left,
                right
            }) => [left.top, right.top])
        ),
    });
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

export const BRACKET_SETS = buildInlineBracketSets();
export const ML_BRACKET_CHARS = buildMultilineBracketChars();
export const ML_BRACKETS_COUNT = MULTILINE_BRACKETS.length;