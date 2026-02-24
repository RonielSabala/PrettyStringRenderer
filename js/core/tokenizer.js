import {
    BRACKET_SETS
} from "./brackets.js";
import {
    SORTED_OPS
} from "./operators.js";
import {
    TOKENS
} from "./tokens.js";

export function tokenize(text) {
    const result = [];
    const colML = {};

    for (const line of text.split('\n')) {
        const tokens = [];
        let i = 0;
        let ilD = 0;
        let lineWidth = line.length;

        while (i < lineWidth) {
            const char = line[i];

            // Whitespace
            if (char === ' ' || char === '\t') {
                let j = i;
                while (j < lineWidth && (line[j] === ' ' || line[j] === '\t')) {
                    j++;
                }

                tokens.push({
                    token: TOKENS.WS,
                    value: line.slice(i, j)
                });

                i = j;
                continue;
            }

            // Comment: # to EOL
            if (char === '#') {
                tokens.push({
                    token: TOKENS.COMMENT,
                    value: line.slice(i)
                });

                i = lineWidth;
                continue;
            }

            // Divider ─ (U+2500) → operator
            if (char === '\u2500') {
                let j = i;
                while (j < lineWidth && line[j] === '\u2500') {
                    j++;
                }

                tokens.push({
                    token: TOKENS.OPERATOR,
                    value: line.slice(i, j)
                });

                i = j;
                continue;
            }

            // ML_OPEN
            if (BRACKET_SETS.open.has(char)) {
                const bracketDepth = colML[i] ?? 0;
                tokens.push({
                    token: TOKENS.BRACKET,
                    value: char,
                    bracketDepth: bracketDepth % 3
                });

                colML[i] = bracketDepth + 1;
                i++;
                continue;
            }

            // ML_CLOSE
            if (BRACKET_SETS.close.has(char)) {
                const bracketDepth = Math.max(0, (colML[i] ?? 0) - 1);
                colML[i] = bracketDepth;
                tokens.push({
                    token: TOKENS.BRACKET,
                    value: char,
                    bracketDepth: bracketDepth % 3
                });

                i++;
                continue;
            }

            // ML_PASS — color = (bracketDepth - 1), same as the opener above
            if (BRACKET_SETS.pass.has(char)) {
                const bracketDepth = colML[i] ?? 0;
                tokens.push({
                    token: TOKENS.BRACKET,
                    value: char,
                    bracketDepth: Math.max(0, bracketDepth - 1) % 3
                });

                i++;
                continue;
            }

            // IL_OPEN
            if (BRACKET_SETS.ilO.has(char)) {
                tokens.push({
                    token: TOKENS.BRACKET,
                    value: char,
                    bracketDepth: ilD % 3
                });

                ilD++;
                i++;
                continue;
            }

            // IL_CLOSE
            if (BRACKET_SETS.ilC.has(char)) {
                ilD = Math.max(0, ilD - 1);
                tokens.push({
                    token: TOKENS.BRACKET,
                    value: char,
                    bracketDepth: ilD % 3
                });

                i++;
                continue;
            }

            // Operators — greedy longest match
            let hit = false;
            for (const op of SORTED_OPS) {
                if (line.startsWith(op, i)) {
                    tokens.push({
                        token: TOKENS.OPERATOR,
                        value: op
                    });

                    i += op.length;
                    hit = true;
                    break;
                }
            }

            if (hit) {
                continue;
            }

            // Semicolon
            if (char === ';') {
                tokens.push({
                    token: TOKENS.SEMICOLON,
                    value: char
                });

                i++;
                continue;
            }

            // Identifier → FUNCTION or VARIABLE
            if (/[a-zA-Z]/.test(char)) {
                let j = i;
                while (j < lineWidth && /[a-zA-Z0-9_]/.test(line[j])) {
                    j++;
                }

                const word = line.slice(i, j);
                let k = j;
                while (k < lineWidth && line[k] === ' ') {
                    k++;
                }

                tokens.push({
                    token: line[k] === '(' ? TOKENS.FUNCTION : TOKENS.VARIABLE,
                    value: word
                });

                i = j;
                continue;
            }

            // Number
            if (/[0-9]/.test(char)) {
                let j = i;
                while (j < lineWidth && /[0-9.]/.test(line[j])) {
                    j++
                };

                tokens.push({
                    token: TOKENS.NUMBER,
                    value: line.slice(i, j)
                });

                i = j;
                continue;
            }

            tokens.push({
                token: TOKENS.UNKNOWN,
                value: char
            });

            i++;
        }

        result.push(tokens);
    }

    return result;
}