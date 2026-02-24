export const INLINE_BRACKETS = Object.freeze(['()', '[]', '{}']);
export const MULTILINE_BRACKETS = Object.freeze([{
        // Round brackets
        lTop: '/',
        lMid: '▏',
        lBot: '\\',
        rTop: '\\',
        rMid: '▕',
        rBot: '/'
    },
    { // Square brackets
        lTop: '┌',
        lMid: '│',
        lBot: '└',
        rTop: '┐',
        rMid: '│',
        rBot: '┘'
    }
]);

function _buildBracketSets() {
    // Inline opening and closing sets
    const inlineOpen = new Set();
    const inlineClose = new Set();

    for (const pair of INLINE_BRACKETS) {
        inlineOpen.add(pair[0]);
        inlineClose.add(pair[1]);
    }

    // All multiline bracket characters
    const multilineAll = new Set();

    for (const bracket of MULTILINE_BRACKETS) {
        multilineAll.add(bracket.lTop);
        multilineAll.add(bracket.lMid);
        multilineAll.add(bracket.lBot);
        multilineAll.add(bracket.rTop);
        multilineAll.add(bracket.rMid);
        multilineAll.add(bracket.rBot);
    }

    return {
        inlineOpen,
        inlineClose,
        multilineAll
    };
}

export const BRACKET_SETS = Object.freeze(_buildBracketSets());