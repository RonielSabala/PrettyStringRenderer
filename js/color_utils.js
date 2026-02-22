import {
    config,
} from "./config.js";
import {
    setColor
} from "./render_controller.js";
import {
    TOKENS,
} from "./tokens.js";


function onPick(key, v) {
    setColor(key, v);
}

function onHex(key, v) {
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) setColor(key, v);
}

function onBgPick(v) {
    setColor('background', v, true);
}

function onBgHex(v) {
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) setColor('background', v, true);
}

function getBracketChipColor(index) {
    return config.colors[`bracket${index % 3}`];
}

function resolveColor(token) {
    const colors = config.colors;
    switch (token.t) {
        case TOKENS.BRACKET:
            return colors[`bracket${token.d}`];
        case TOKENS.OPERATOR:
            return colors.operator;
        case TOKENS.FUNCTION:
            return colors.function;
        case TOKENS.VARIABLE:
            return colors.variable;
        case TOKENS.SEMICOLON:
            return colors.semicolon;
        case TOKENS.COMMENT:
            return colors.comment;
        case TOKENS.NUMBER:
            return colors.number;
        case TOKENS.WS:
            return null;
        default:
            return colors.unknown;
    }
}

export {
    getBracketChipColor,
    onBgHex,
    onBgPick,
    onHex,
    onPick,
    resolveColor
};