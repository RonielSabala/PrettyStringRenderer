import {
    findBracketsWithDepth
} from './bracket_detector.js';

class LineAnalysis {
    constructor(lineWidth) {
        this.bracketArmDepths = new Array(lineWidth).fill(undefined);
        this.bracketNestingDepths = new Int32Array(lineWidth).fill(0);
    }

    equals(other) {
        if (!other || this.bracketArmDepths.length !== other.bracketArmDepths.length) {
            return false;
        }

        const otherBoundary = other.bracketArmDepths;
        const otherContainment = other.bracketNestingDepths;
        return (
            this.bracketArmDepths.every((item, i) => item === otherBoundary[i]) &&
            this.bracketNestingDepths.every((item, i) => item === otherContainment[i])
        );
    }
}

export function generateAnalysisMap(lines) {
    const foundBrackets = findBracketsWithDepth(lines);
    const foundBracketsCount = foundBrackets.length;

    return lines.map((line, y) => {
        const lineWidth = line.length;
        const lineAnalysis = new LineAnalysis(lineWidth);

        for (let i = 0; i < foundBracketsCount; i++) {
            const bracket = foundBrackets[i];
            const depth = bracket.depth;
            const x1 = bracket.x1;
            const x2 = bracket.x2;

            if (y < bracket.y1 || y > bracket.y2) {
                continue;
            }
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
    });
}