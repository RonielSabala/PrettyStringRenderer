import {
    ML_BRACKET_CHARS
} from './data.js';

class LineAnalysis {
    constructor(lineWidth) {
        this.bracketArmDepths = new Array(lineWidth).fill(undefined);
        this.bracketNestingDepths = new Int32Array(lineWidth).fill(0);
    }

    equals(other) {
        if (this === other) {
            return true;
        }

        const boundaryA = this.bracketArmDepths;
        const boundaryB = other.bracketArmDepths;
        const len = boundaryA.length;

        if (!other || len !== boundaryB.length) {
            return false;
        }

        const containmentA = this.bracketNestingDepths;
        const containmentB = other.bracketNestingDepths;

        for (let i = 0; i < len; i++) {
            if (boundaryA[i] !== boundaryB[i] || containmentA[i] !== containmentB[i]) {
                return false;
            }
        }

        return true;
    }
}

export function lineHasBracketChars(line) {
    const lineWidth = line.length;
    for (let i = 0; i < lineWidth; i++) {
        if (ML_BRACKET_CHARS.has(line[i])) {
            return true;
        }
    }

    return false;
}

export function getLineAnalysis(line, lineIdx, brackets) {
    const lineWidth = line.length;
    const lineAnalysis = new LineAnalysis(lineWidth);

    if (!lineHasBracketChars(line)) {
        return lineAnalysis;
    }

    for (const bracket of brackets) {
        if (lineIdx < bracket.y1 || lineIdx > bracket.y2) {
            continue;
        }

        const x1 = bracket.x1;
        const x2 = bracket.x2;
        const depth = bracket.depth;

        if (x1 < lineWidth) {
            lineAnalysis.bracketArmDepths[x1] = depth;
        }
        if (x2 < lineWidth) {
            lineAnalysis.bracketArmDepths[x2] = depth;
        }

        // Mark chars between the left and right arms
        const xStart = x1 + 1;
        const xEnd = Math.min(lineWidth, x2);
        for (let x = xStart; x < xEnd; x++) {
            lineAnalysis.bracketNestingDepths[x]++;
        }
    }

    return lineAnalysis;
}