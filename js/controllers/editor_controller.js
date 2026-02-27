import {
    EDITOR_DEFAULTS
} from '../common/config.js';
import {
    canvasWrapElement,
    editorElement,
    editorFontSizeElement,
    editorPanelElement,
    editorResizeHandleElement,
} from '../common/elements.js';
import {
    parseNumber
} from '../common/parse_utils.js';
import {
    tokenize
} from '../core/tokenizer.js';
import {
    redraw,
    setTokenizedLines
} from "./render_controller.js";

let startY = 0;
let startHeight = 0;
let dragging = false;

export function onResize(event) {
    dragging = true;

    startY = event.clientY;
    startHeight = editorPanelElement.offsetHeight;

    editorResizeHandleElement.classList.add('drag');
    document.body.style.userSelect = 'none';

    event.preventDefault();
}

export function onEditorInput() {
    const tokenizedLines = tokenize(editorElement.value);
    setTokenizedLines(tokenizedLines);
    redraw();
}

export function onEditorFontSize() {
    const newFontSize = parseNumber(editorFontSizeElement, EDITOR_DEFAULTS.fontSize);
    editorElement.style.fontSize = `${newFontSize}px`;
}

export function onEditorMouseMove(event) {
    if (!dragging) {
        return;
    }

    const newHeight = Math.max(55, Math.min(window.innerHeight * 0.8, startHeight + (startY - event.clientY)));
    editorPanelElement.style.height = `${newHeight}px`;
    redraw();
}

export function onEditorMouseUp() {
    if (!dragging) {
        return;
    }

    dragging = false;
    editorResizeHandleElement.classList.remove('drag');
    document.body.style.userSelect = '';
}

export function onEscape(event) {
    if (event.code !== 'Escape') {
        return;
    }

    event.preventDefault();
    canvasWrapElement.focus();
}