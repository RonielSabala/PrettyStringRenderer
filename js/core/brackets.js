export const INLINE_PAIRS = Object.freeze(['()', '[]', '{}']);

export const MULTILINE_BRACKETS = Object.freeze([{
        type: 'round',
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
    },
    {
        type: 'square',
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
    }
]);

function buildBracketSets() {
    const inlineOpen = new Set(INLINE_PAIRS.map(p => p[0]));
    const inlineClose = new Set(INLINE_PAIRS.map(p => p[1]));

    const multilineAll = new Set();
    for (const b of MULTILINE_BRACKETS) {
        Object.values(b.left).forEach(char => multilineAll.add(char));
        Object.values(b.right).forEach(char => multilineAll.add(char));
    }

    return {
        inlineOpen,
        inlineClose,
        multilineAll
    };
}

export const BRACKET_SETS = Object.freeze(buildBracketSets());