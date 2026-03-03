import {
    EDITOR_DEFAULTS
} from '../common/config.js';
import {
    CSS,
    CSS_USER_SELECT
} from '../common/css_classes.js';
import {
    canvasWrapElement,
    editorElement,
    editorFontSizeElement,
    editorPanelElement,
    editorResizeHandleElement,
} from '../common/elements.js';
import {
    KEYS
} from '../common/keys.js';
import {
    parseNumber
} from '../common/parse_utils.js';
import {
    toPx
} from '../common/resolution_utils.js';
import {
    IncrementalTokenizer
} from '../core/tokenizer.js';
import {
    redraw,
    setTokenizedLines
} from './render_controller.js';

const _tokenizer = new IncrementalTokenizer();

let startY = 0;
let startHeight = 0;
let dragging = false;

export function onResize(event) {
    event.preventDefault();

    dragging = true;
    startY = event.clientY;
    startHeight = editorPanelElement.offsetHeight;

    document.body.style.userSelect = CSS_USER_SELECT.NONE;
    editorResizeHandleElement.classList.add(CSS.DRAG);
}

export function onEditorChange() {
    const tokenizedLines = _tokenizer.tokenize(editorElement.value);
    setTokenizedLines(tokenizedLines);
    redraw();
}

export function onEditorFontSize() {
    const newFontSize = parseNumber(editorFontSizeElement, EDITOR_DEFAULTS.fontSize);
    editorElement.style.fontSize = toPx(newFontSize);
}

export function onEditorMouseMove(event) {
    if (!dragging) {
        return;
    }

    const newHeight = Math.max(55, Math.min(window.innerHeight * 0.8, startHeight + (startY - event.clientY)));
    editorPanelElement.style.height = toPx(newHeight);
    redraw();
}

export function onEditorMouseUp() {
    if (!dragging) {
        return;
    }

    dragging = false;
    document.body.style.userSelect = CSS_USER_SELECT.AUTO;
    editorResizeHandleElement.classList.remove(CSS.DRAG);
}

export function onEscapeToCanvas(event) {
    if (event.code !== KEYS.ESCAPE) {
        return;
    }

    event.preventDefault();
    canvasWrapElement.focus();
}