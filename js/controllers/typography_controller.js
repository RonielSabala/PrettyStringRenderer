import {
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS,
    config
} from '../common/config.js';
import {
    redraw
} from './render_controller.js';

function _parseNumber(htmlElement, fallback) {
    const number = parseFloat(htmlElement.value);
    return isNaN(number) ? fallback : number;
}

function onFontSizeConfig() {
    const fontSizeElement = document.getElementById('c-fs');
    config.fontSize = _parseNumber(fontSizeElement, CANVAS_DEFAULTS.fontSize);
    redraw();
}

function onLineHeightConfig() {
    const lineHeightElement = document.getElementById('c-lh');
    config.lineHeight = _parseNumber(lineHeightElement, CANVAS_DEFAULTS.lineHeight);
    redraw();
}

function onLetterSpacingConfig() {
    const letterSpacingElement = document.getElementById('c-ls');
    config.letterSpacing = _parseNumber(letterSpacingElement, CANVAS_DEFAULTS.letterSpacing);
    redraw();
}

function onPadXConfig() {
    const padXElement = document.getElementById('c-px');
    config.padX = _parseNumber(padXElement, CANVAS_DEFAULTS.padX);
    redraw();
}

function onPadYConfig() {
    const padYElement = document.getElementById('c-py');
    config.padY = _parseNumber(padYElement, CANVAS_DEFAULTS.padY);
    redraw();
}

function onEditorFontSize() {
    const editorElement = document.getElementById('ed');
    const editorFontSizeElement = document.getElementById('ed-fs');
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