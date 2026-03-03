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
    editorResizeHandleElement
} from '../common/elements.js';
import {
    KEYS
} from '../common/keys.js';
import {
    state
} from '../common/store.js';
import {
    initNumberInput
} from '../utils/init.js';
import {
    parseNumber
} from '../utils/parse.js';
import {
    toPx
} from '../utils/resolution.js';
import {
    redraw
} from './canvas_buffer.js';
import {
    updateZoomInfo
} from './canvas_controller.js';

let startY = 0;
let startHeight = 0;
let dragging = false;

export function initEditorPanel() {
    updateZoomInfo();
    initNumberInput(editorFontSizeElement, EDITOR_DEFAULTS.fontSize)

    editorElement.scrollTop = 0;
    editorElement.setSelectionRange(0, 0);
    editorElement.value = EDITOR_DEFAULTS.content;
    editorElement.style.fontSize = toPx(EDITOR_DEFAULTS.fontSize.value);
    editorElement.style.lineHeight = EDITOR_DEFAULTS.lineHeight;
    editorElement.style.letterSpacing = EDITOR_DEFAULTS.letterSpacing;
    editorElement.style.padding = `${toPx(EDITOR_DEFAULTS.padX)} ${toPx(EDITOR_DEFAULTS.padY)}`;
}

export function onResize(event) {
    event.preventDefault();

    dragging = true;
    startY = event.clientY;
    startHeight = editorPanelElement.offsetHeight;

    document.body.style.userSelect = CSS_USER_SELECT.NONE;
    editorResizeHandleElement.classList.add(CSS.DRAG);
}

export function onEditorChange() {
    state.tokenizer.tokenize(editorElement.value);
    redraw();
}

export function onEditorFontSize() {
    const newFontSize = parseNumber(editorFontSizeElement.value, EDITOR_DEFAULTS.fontSize.value);
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