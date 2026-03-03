import {
    MULTILINE_BRACKETS
} from './data.js';

function _armMatches(lines, x, y, char) {
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
                while (_armMatches(lines, x, yEnd, part.mid)) {
                    yEnd++;
                }

                if (!_armMatches(lines, x, yEnd, part.bottom)) {
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

                // Pop matching left arm
                const stack = stacks.get(key);
                if (!stack?.length) {
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
    const brackets = _detectMultilineBrackets(lines);
    if (brackets.length === 0) {
        return brackets;
    }

    brackets.sort((bracketA, bracketB) =>
        bracketA.y1 !== bracketB.y1 ? bracketA.y1 - bracketB.y1 :
        bracketA.x1 !== bracketB.x1 ? bracketA.x1 - bracketB.x1 :
        (bracketB.x2 - bracketB.x1) - (bracketA.x2 - bracketA.x1)
    );

    const stack = [];
    for (const bracket of brackets) {
        while (stack.length > 0) {
            const top = stack[stack.length - 1];
            if (top.x2 > bracket.x1 && top.y2 >= bracket.y1) {
                break;
            }

            stack.pop();
        }

        bracket.depth = stack.length;
        stack.push(bracket);
    }

    return brackets;
}