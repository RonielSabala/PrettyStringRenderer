import {
    BRACKETS
} from "./brackets.js";
import {
    config
} from "./config.js";
import {
    T
} from "./tokens.js";

// Fast lookup sets derived from the above arrays
function buildBracketSets() {
    return {
        open: new Set(BRACKETS.ML_OPEN),
        close: new Set(BRACKETS.ML_CLOSE),
        pass: new Set(BRACKETS.ML_PASS),
        ilO: new Set(BRACKETS.IL_OPEN),
        ilC: new Set(BRACKETS.IL_CLOSE),
    };
}

export function tokenize(text) {
    const lines = text.split('\n');
    const result = [];
    const colML = {}; // column → current ML open-depth
    const sets = buildBracketSets();
    const sortedOps = [...config.operators].sort((a, b) => b.length - a.length);

    for (const raw of lines) {
        const toks = [];
        let i = 0,
            n = raw.length,
            ilD = 0;

        while (i < n) {
            const ch = raw[i];

            // Whitespace
            if (ch === ' ' || ch === '\t') {
                let j = i;
                while (j < n && (raw[j] === ' ' || raw[j] === '\t')) j++;
                toks.push({
                    t: T.WS,
                    v: raw.slice(i, j)
                });
                i = j;
                continue;
            }

            // Comment: # to EOL
            if (ch === '#') {
                toks.push({
                    t: T.COMMENT,
                    v: raw.slice(i)
                });
                i = n;
                continue;
            }

            // Divider ─ (U+2500) → operator
            if (ch === '\u2500') {
                let j = i;
                while (j < n && raw[j] === '\u2500') j++;
                toks.push({
                    t: T.OPERATOR,
                    v: raw.slice(i, j)
                });
                i = j;
                continue;
            }

            // ML_OPEN
            if (sets.open.has(ch)) {
                const d = colML[i] ?? 0;
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: d % 3
                });
                colML[i] = d + 1;
                i++;
                continue;
            }

            // ML_CLOSE
            if (sets.close.has(ch)) {
                const d = Math.max(0, (colML[i] ?? 0) - 1);
                colML[i] = d;
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: d % 3
                });
                i++;
                continue;
            }

            // ML_PASS — color = (depth - 1), same as the opener above
            if (sets.pass.has(ch)) {
                const d = colML[i] ?? 0;
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: Math.max(0, d - 1) % 3
                });
                i++;
                continue;
            }

            // IL_OPEN
            if (sets.ilO.has(ch)) {
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: ilD % 3
                });
                ilD++;
                i++;
                continue;
            }

            // IL_CLOSE
            if (sets.ilC.has(ch)) {
                ilD = Math.max(0, ilD - 1);
                toks.push({
                    t: T.BRACKET,
                    v: ch,
                    d: ilD % 3
                });
                i++;
                continue;
            }

            // Operators — greedy longest match
            let hit = false;
            for (const op of sortedOps) {
                if (raw.startsWith(op, i)) {
                    toks.push({
                        t: T.OPERATOR,
                        v: op
                    });
                    i += op.length;
                    hit = true;
                    break;
                }
            }
            if (hit) continue;

            // Semicolon
            if (ch === ';') {
                toks.push({
                    t: T.SEMICOLON,
                    v: ch
                });
                i++;
                continue;
            }

            // Identifier → FUNCTION or VARIABLE
            if (/[a-zA-Z]/.test(ch)) {
                let j = i;
                while (j < n && /[a-zA-Z0-9_]/.test(raw[j])) j++;
                const word = raw.slice(i, j);
                let k = j;
                while (k < n && raw[k] === ' ') k++;
                toks.push({
                    t: raw[k] === '(' ? T.FUNCTION : T.VARIABLE,
                    v: word
                });
                i = j;
                continue;
            }

            // Number
            if (/[0-9]/.test(ch)) {
                let j = i;
                while (j < n && /[0-9.]/.test(raw[j])) j++;
                toks.push({
                    t: T.NUMBER,
                    v: raw.slice(i, j)
                });
                i = j;
                continue;
            }

            toks.push({
                t: T.UNKNOWN,
                v: ch
            });
            i++;
        }
        result.push(toks);
    }
    return result;
}