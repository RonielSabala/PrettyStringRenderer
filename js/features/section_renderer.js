import {
    DEFAULT_THEME,
    MAX_HEX_INPUT_LENGTH,
    TYPOGRAPHY_DEFAULTS
} from '../common/config.js';
import {
    CSS
} from '../common/constants/css.js';
import {
    sectionBracketColors,
    sectionCanvasColors,
    sectionSyntaxColors,
    sectionTypography
} from '../common/elements.js';
import {
    camelToKebab,
    camelToTitle,
    toTitle
} from '../utils/parse.js';

// Private helpers

function _createColorRow(id, labelText) {
    const row = document.createElement('div');
    const label = document.createElement('label');
    const swatch = document.createElement('div');
    const swatchFill = document.createElement('div');
    const colorPicker = document.createElement('input');
    const hexInput = document.createElement('input');

    row.className = CSS.ROW;
    label.textContent = labelText;

    swatch.className = CSS.SWATCH;
    swatchFill.className = CSS.SWATCH_FILL;
    swatchFill.id = `${CSS.SWATCH_FILL}-${id}`;

    colorPicker.type = CSS.COLOR_TYPE;
    colorPicker.id = `${CSS.COLOR_PICKER}-${id}`;

    hexInput.className = CSS.HEX_INPUT;
    hexInput.id = `${CSS.HEX_INPUT}-${id}`;
    hexInput.maxLength = MAX_HEX_INPUT_LENGTH;

    swatch.append(swatchFill, colorPicker);
    row.append(label, swatch, hexInput);
    return row;
}

function _createNumberRow(id, labelText) {
    const row = document.createElement('div');
    const label = document.createElement('label');
    const numInput = document.createElement('input');

    row.className = CSS.ROW;
    label.textContent = labelText;

    numInput.type = CSS.NUMBER_TYPE;
    numInput.className = CSS.NUMBER_INPUT;
    numInput.id = id;

    row.append(label, numInput);
    return row;
}

function _renderSection(container, rows) {
    const sectionBody = document.createElement('div');
    sectionBody.className = CSS.SECTION_BODY;
    sectionBody.append(...rows);
    container.appendChild(sectionBody);
}

function _renderBracketSection(container, colors) {
    const rows = Object.keys(colors).map((_, i) =>
        _createColorRow(`${CSS.BRACKET}${i}`, `Level ${i + 1}`)
    );

    _renderSection(container, rows);
}

function _renderColorSection(container, keys) {
    const rows = Object.keys(keys).map(key =>
        _createColorRow(key, toTitle(key))
    );

    _renderSection(container, rows);
}

function _renderNumberSection(container, keys) {
    const rows = keys.map(key =>
        _createNumberRow(`${CSS.TYPOGRAPHY}-${camelToKebab(key)}`, camelToTitle(key))
    );

    _renderSection(container, rows);
}

// Public method

export function initSections() {
    const {
        bracket,
        background,
        ...syntaxColors
    } = DEFAULT_THEME;

    _renderBracketSection(sectionBracketColors, bracket);
    _renderColorSection(sectionSyntaxColors, syntaxColors);
    _renderColorSection(sectionCanvasColors, {
        background
    });
    _renderNumberSection(sectionTypography, Object.keys(TYPOGRAPHY_DEFAULTS))
}