import {
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS,
    config
} from '../common/config.js';
import {
    redraw
} from './render_controller.js';

const fontSizeElement = document.getElementById('typography-font-size');
const lineHeightElement = document.getElementById('typography-line-height');
const letterSpacingElement = document.getElementById('typography-letter-spacing');
const padXElement = document.getElementById('typography-pad-x');
const padYElement = document.getElementById('typography-pad-y');

const editorElement = document.getElementById('editor');
const editorFontSizeElement = document.getElementById('editor-font-size');

function _parseNumber(htmlElement, fallback) {
    const number = parseFloat(htmlElement.value);
    return isNaN(number) ? fallback : number;
}

function onFontSizeConfig() {
    config.fontSize = _parseNumber(fontSizeElement, CANVAS_DEFAULTS.fontSize);
    redraw();
}

function onLineHeightConfig() {
    config.lineHeight = _parseNumber(lineHeightElement, CANVAS_DEFAULTS.lineHeight);
    redraw();
}

function onLetterSpacingConfig() {
    config.letterSpacing = _parseNumber(letterSpacingElement, CANVAS_DEFAULTS.letterSpacing);
    redraw();
}

function onPadXConfig() {
    config.padX = _parseNumber(padXElement, CANVAS_DEFAULTS.padX);
    redraw();
}

function onPadYConfig() {
    config.padY = _parseNumber(padYElement, CANVAS_DEFAULTS.padY);
    redraw();
}

function onEditorFontSize() {
    const newFontSize = _parseNumber(editorFontSizeElement, EDITOR_DEFAULTS.fontSize);
    editorElement.style.fontSize = `${newFontSize}px`;
}

export {
    onEditorFontSize,
    onFontSizeConfig,
    onLetterSpacingConfig,
    onLineHeightConfig,
    onPadXConfig,
    onPadYConfig
};