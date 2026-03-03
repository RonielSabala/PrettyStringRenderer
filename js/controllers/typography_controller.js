import {
    CANVAS_DEFAULTS,
    config
} from '../common/config.js';
import {
    typographyFontSizeElement,
    typographyLetterSpacingElement,
    typographyLineHeightElement,
    typographyPadXElement,
    typographyPadYElement
} from '../common/elements.js';
import {
    parseNumber
} from '../common/parse_utils.js';
import {
    redraw
} from './render_controller.js';

export function onFontSizeConfig() {
    config.fontSize = parseNumber(typographyFontSizeElement.value, CANVAS_DEFAULTS.fontSize.value);
    redraw();
}

export function onLineHeightConfig() {
    config.lineHeight = parseNumber(typographyLineHeightElement.value, CANVAS_DEFAULTS.lineHeight.value);
    redraw();
}

export function onLetterSpacingConfig() {
    config.letterSpacing = parseNumber(typographyLetterSpacingElement.value, CANVAS_DEFAULTS.letterSpacing.value);
    redraw();
}

export function onPadXConfig() {
    config.padX = parseNumber(typographyPadXElement.value, CANVAS_DEFAULTS.padX.value);
    redraw();
}

export function onPadYConfig() {
    config.padY = parseNumber(typographyPadYElement.value, CANVAS_DEFAULTS.padY.value);
    redraw();
}