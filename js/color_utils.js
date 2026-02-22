import {
    config,
} from "./config.js";
import {
    setColor
} from "./render_controller.js";
import {
    TOKENS,
} from "./tokens.js";


function onPick(key, value) {
    setColor(key, value);
}

function onHex(key, value) {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) setColor(key, value);
}

function onBgPick(value) {
    setColor('background', value);
}

function onBgHex(value) {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) setColor('background', value);
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