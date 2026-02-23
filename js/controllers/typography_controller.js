import {
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS,
    config
} from '../common/config.js';
import {
    redraw
} from './render_controller.js';

const fontSizeElement = document.getElementById('c-fs');
const lineHeightElement = document.getElementById('c-lh');
const letterSpacingElement = document.getElementById('c-ls');
const padXElement = document.getElementById('c-px');
const padYElement = document.getElementById('c-py');

const editorElement = document.getElementById('ed');
const editorFontSizeElement = document.getElementById('ed-fs');

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