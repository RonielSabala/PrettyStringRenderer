const INLINE_PAIRS = Object.freeze(['()', '[]', '{}']);

const MULTILINE_BRACKETS = Object.freeze([{
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
    },
    {
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
    }
]);

function _buildBracketSets() {
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

export const BRACKET_SETS = Object.freeze(_buildBracketSets());

function _match(lines, x, y, char) {
    return y < lines.length && lines[y][x] === char;
}

function _detectMultilineBrackets(lines) {
    const brackets = [];
    const stacks = new Map();
    const height = lines.length;

    for (let y = 0; y < height; y++) {
        const line = lines[y];
        const lineWidth = line.length;

        for (let x = 0; x < lineWidth; x++) {
            const char = line[x];

            for (let bracketIdx = 0; bracketIdx < MULTILINE_BRACKETS.length; bracketIdx++) {
                const bracket = MULTILINE_BRACKETS[bracketIdx];
                const isLeft = char === bracket.left.top;
                const isRight = char === bracket.right.top;

                if (!isLeft && !isRight) {
                    continue;
                }

                let yEnd = y + 1;
                const part = isLeft ? bracket.left : bracket.right;
                while (_match(lines, x, yEnd, part.mid)) {
                    yEnd++;
                }

                if (!_match(lines, x, yEnd, part.bottom)) {
                    continue;
                }

                const key = `${y}-${yEnd}-${bracketIdx}`;
                if (isLeft) {
                    if (!stacks.has(key)) {
                        stacks.set(key, []);
                    }

                    stacks.get(key).push(x);
                    continue;
                }

                const stack = stacks.get(key);
                if (!stack || stack.length === 0) {
                    continue;
                }

                brackets.push({
                    x1: stack.pop(),
                    y1: y,
                    x2: x,
                    y2: yEnd
                });
            }
        }
    }

    return brackets;
}

export function findBracketsWithDepth(lines) {
    const foundBrackets = _detectMultilineBrackets(lines);
    foundBrackets.forEach(bracket => {
        bracket.depth = foundBrackets.reduce((acc, other) => {
            const isInside = (
                other !== bracket &&
                bracket.x1 > other.x1 &&
                bracket.x2 < other.x2 &&
                bracket.y1 >= other.y1 &&
                bracket.y2 <= other.y2
            );

            return isInside ? acc + 1 : acc;
        }, 0);
    });

    return foundBrackets;
}