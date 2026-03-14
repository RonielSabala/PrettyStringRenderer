import {
    MAX_HEX_INPUT_LENGTH
} from '../common/config.js';
import {
    CSS
} from '../common/constants/css.js';

export function createColorRow(id, labelText) {
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

export function createNumberRow(HTMLInputId, labelText) {
    const row = document.createElement('div');
    const label = document.createElement('label');
    const numInput = document.createElement('input');

    row.className = CSS.ROW;
    label.textContent = labelText;

    numInput.type = CSS.NUMBER_TYPE;
    numInput.className = CSS.NUMBER_INPUT;
    numInput.id = HTMLInputId;

    row.append(label, numInput);
    return [row, numInput];
}

export function renderSection(container, rows) {
    const sectionBody = document.createElement('div');
    sectionBody.className = CSS.SECTION_BODY;
    sectionBody.append(...rows);
    container.appendChild(sectionBody);
}