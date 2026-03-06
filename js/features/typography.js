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
import {
    saveConfigState
} from '../utils/persistence.js';

export function initTypographySection() {
    const config = state.config;
    initNumberInput(typographyFontSizeElement, config.fontSize, CANVAS_DEFAULTS.fontSize)
    initNumberInput(typographyLineHeightElement, config.lineHeight, CANVAS_DEFAULTS.lineHeight)
    initNumberInput(typographyLetterSpacingElement, config.letterSpacing, CANVAS_DEFAULTS.letterSpacing)
    initNumberInput(typographyPadXElement, config.padX, CANVAS_DEFAULTS.padX)
    initNumberInput(typographyPadYElement, config.padY, CANVAS_DEFAULTS.padY)
}

export function onFontSizeConfig() {
    state.config.fontSize = parseNumber(typographyFontSizeElement.value, CANVAS_DEFAULTS.fontSize.value);
    saveConfigState();
    redraw();
}

export function onLineHeightConfig() {
    state.config.lineHeight = parseNumber(typographyLineHeightElement.value, CANVAS_DEFAULTS.lineHeight.value);
    saveConfigState();
    redraw();
}

export function onLetterSpacingConfig() {
    state.config.letterSpacing = parseNumber(typographyLetterSpacingElement.value, CANVAS_DEFAULTS.letterSpacing.value);
    saveConfigState();
    redraw();
}

export function onPadXConfig() {
    state.config.padX = parseNumber(typographyPadXElement.value, CANVAS_DEFAULTS.padX.value);
    saveConfigState();
    redraw();
}

export function onPadYConfig() {
    state.config.padY = parseNumber(typographyPadYElement.value, CANVAS_DEFAULTS.padY.value);
    saveConfigState();
    redraw();
}