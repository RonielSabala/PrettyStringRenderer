import {
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS,
    config
} from '../common/config.js';
import {
    editorElement,
    editorFontSizeElement,
    typographyFontSizeElement,
    typographyLetterSpacingElement,
    typographyLineHeightElement,
    typographyPadXElement,
    typographyPadYElement
} from '../common/elements.js';
import {
    redraw
} from './render_controller.js';

function _parseNumber(htmlElement, fallback) {
    const number = parseFloat(htmlElement.value);
    return isNaN(number) ? fallback.value : number;
}

export function onFontSizeConfig() {
    config.fontSize = _parseNumber(typographyFontSizeElement, CANVAS_DEFAULTS.fontSize);
    redraw();
}

export function onLineHeightConfig() {
    config.lineHeight = _parseNumber(typographyLineHeightElement, CANVAS_DEFAULTS.lineHeight);
    redraw();
}

export function onLetterSpacingConfig() {
    config.letterSpacing = _parseNumber(typographyLetterSpacingElement, CANVAS_DEFAULTS.letterSpacing);
    redraw();
}

export function onPadXConfig() {
    config.padX = _parseNumber(typographyPadXElement, CANVAS_DEFAULTS.padX);
    redraw();
}

export function onPadYConfig() {
    config.padY = _parseNumber(typographyPadYElement, CANVAS_DEFAULTS.padY);
    redraw();
}

export function onEditorFontSize() {
    const newFontSize = _parseNumber(editorFontSizeElement, EDITOR_DEFAULTS.fontSize);
    editorElement.style.fontSize = `${newFontSize}px`;
}