import {
    redraw
} from '../canvas/buffer.js';
import {
    CANVAS_DEFAULTS
} from '../common/config.js';
import {
    typographyFontSizeElement,
    typographyLetterSpacingElement,
    typographyLineHeightElement,
    typographyPadXElement,
    typographyPadYElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    initNumberInput
} from '../utils/init.js';
import {
    parseNumber
} from '../utils/parse.js';

export function initTypographyPanel() {
    initNumberInput(typographyFontSizeElement, CANVAS_DEFAULTS.fontSize)
    initNumberInput(typographyLineHeightElement, CANVAS_DEFAULTS.lineHeight)
    initNumberInput(typographyLetterSpacingElement, CANVAS_DEFAULTS.letterSpacing)
    initNumberInput(typographyPadXElement, CANVAS_DEFAULTS.padX)
    initNumberInput(typographyPadYElement, CANVAS_DEFAULTS.padY)
}

export function onFontSizeConfig() {
    state.config.fontSize = parseNumber(typographyFontSizeElement.value, CANVAS_DEFAULTS.fontSize.value);
    redraw();
}

export function onLineHeightConfig() {
    state.config.lineHeight = parseNumber(typographyLineHeightElement.value, CANVAS_DEFAULTS.lineHeight.value);
    redraw();
}

export function onLetterSpacingConfig() {
    state.config.letterSpacing = parseNumber(typographyLetterSpacingElement.value, CANVAS_DEFAULTS.letterSpacing.value);
    redraw();
}

export function onPadXConfig() {
    state.config.padX = parseNumber(typographyPadXElement.value, CANVAS_DEFAULTS.padX.value);
    redraw();
}

export function onPadYConfig() {
    state.config.padY = parseNumber(typographyPadYElement.value, CANVAS_DEFAULTS.padY.value);
    redraw();
}