import {
    BRACKET_SETS,
    ML_BRACKETS_COUNT,
    MULTILINE_BRACKETS
} from './data.js';

function _sortBrackets(a, b) {
    const dy = a.y1 - b.y1;
    if (dy !== 0) {
        return dy;
    }

    const dx = a.x1 - b.x1;
    if (dx !== 0) {
        return dx
    };

    return (b.x2 - b.x1) - (a.x2 - a.x1);
}

function _assignDepths(brackets) {
    const stack = [];
    for (const bracket of brackets) {
        const x1 = bracket.x1;
        const y1 = bracket.y1;

        while (stack.length > 0) {
            const top = stack[stack.length - 1];
            if (top.x2 > x1 && top.y2 >= y1) {
                break;
            }

            stack.pop();
        }

        bracket.depth = stack.length;
        stack.push(bracket);
    }
}

export function detectBrackets(lines, yStart, yEnd) {
    const brackets = [];
    const stacks = new Map();
    const linesCount = lines.length;

    yEnd = Math.min(yEnd ?? Infinity, linesCount - 1);

    for (let y = yStart; y <= yEnd; y++) {
        const line = lines[y];
        const lineWidth = line.length;

        for (let x = 0; x < lineWidth; x++) {
            const char = line[x];
            if (!BRACKET_SETS.multilineOpen.has(char)) {
                continue;
            }

            for (let i = 0; i < ML_BRACKETS_COUNT; i++) {
                const bracket = MULTILINE_BRACKETS[i];
                const isLeft = char === bracket.left.top;
                const bracketArm = isLeft ? bracket.left : bracket.right;
                const midChar = bracketArm.mid;
                const bottomChar = bracketArm.bottom;

                let y2 = y + 1;
                while (y2 < linesCount && lines[y2][x] === midChar) {
                    y2++;
                }

                if (y2 >= linesCount || lines[y2][x] !== bottomChar) {
                    continue;
                }

                const key = `${y}-${y2}-${i}`;
                if (isLeft) {
                    if (!stacks.has(key)) {
                        stacks.set(key, []);
                    }

                    stacks.get(key).push(x);
                    continue;
                }

                const stack = stacks.get(key);
                if (!stack?.length) {
                    continue;
                }

                brackets.push({
                    x1: stack.pop(),
                    y1: y,
                    x2: x,
                    y2: y2
                });
            }
        }
    }

    return brackets;
}

export function buildBracketsWithDepth(brackets) {
    if (brackets.length > 0) {
        brackets.sort(_sortBrackets);
        _assignDepths(brackets);
    }

    return brackets;
}
