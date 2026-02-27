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
    config.fontSize = parseNumber(typographyFontSizeElement, CANVAS_DEFAULTS.fontSize);
    redraw();
}

export function onLineHeightConfig() {
    config.lineHeight = parseNumber(typographyLineHeightElement, CANVAS_DEFAULTS.lineHeight);
    redraw();
}

export function onLetterSpacingConfig() {
    config.letterSpacing = parseNumber(typographyLetterSpacingElement, CANVAS_DEFAULTS.letterSpacing);
    redraw();
}

export function onPadXConfig() {
    config.padX = parseNumber(typographyPadXElement, CANVAS_DEFAULTS.padX);
    redraw();
}

export function onPadYConfig() {
    config.padY = parseNumber(typographyPadYElement, CANVAS_DEFAULTS.padY);
    redraw();
}