import {
    redraw
} from '../canvas/buffer.js';
import {
    adjustCanvas,
    updateZoomInfo
} from '../canvas/controller.js';
import {
    EDITOR_DEFAULTS,
    EDITOR_MAX_HEIGHT_PERCENTAGE,
    EDITOR_MIN_HEIGHT_PX
} from '../common/config.js';
import {
    CSS,
    CSS_USER_SELECT
} from '../common/constants/css.js';
import {
    EVENTS
} from '../common/constants/events.js';
import {
    KEYS
} from '../common/constants/keys.js';
import {
    canvasWrapElement,
    editorElement,
    editorFontSizeElement,
    editorPanelElement,
    editorResizeHandleElement
} from '../common/elements.js';
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
    saveEditorConfigState
} from '../utils/persistence.js';
import {
    toPx
} from '../utils/resolution.js';

let startY = 0;
let startHeight = 0;
let startMaxHeight = 0;
let dragging = false;

const CONFIG_KEY_TO_ELEMENT = [
    ['content', [editorElement, EVENTS.INPUT, _onEditorContentChange]],
    ['fontSize', [editorFontSizeElement, EVENTS.INPUT, _onEditorFontSize]],
    ['cursorSelection', [editorElement, EVENTS.CLICK, _onEditorCursorChange]],
    ['cursorSelection', [editorElement, EVENTS.KEY_UP, _onEditorCursorChange]],
];

function _getHeight(y) {
    return Math.min(startMaxHeight, startHeight + (startY - y));
}

function _arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    return arr1.every((element, index) => element === arr2[index]);
}

function _onEditorContentChange() {
    const content = editorElement.value;
    state.tokenizer.tokenize(content);
    redraw();
    return content;
}

function _onEditorFontSize() {
    const fontSize = parseNumber(editorFontSizeElement.value, EDITOR_DEFAULTS.fontSize.value);
    editorElement.style.fontSize = toPx(fontSize);
    return fontSize;
}

function _onEditorCursorChange() {
    return [editorElement.selectionStart, editorElement.selectionEnd];
}

export function initEditorSection() {
    updateZoomInfo();
    const config = state.editorConfig;

    // Configure editor
    editorElement.scrollTop = 0;
    editorElement.style.fontSize = toPx(config.fontSize);
    editorElement.style.lineHeight = EDITOR_DEFAULTS.lineHeight;
    editorElement.style.letterSpacing = EDITOR_DEFAULTS.letterSpacing;
    editorElement.style.padding = `${toPx(EDITOR_DEFAULTS.padX)} ${toPx(EDITOR_DEFAULTS.padY)}`;
    editorElement.value = config.content ?? EDITOR_DEFAULTS.content;

    // Set cursor selection
    const cursorSelection = config.cursorSelection;
    if (cursorSelection.length > 0) {
        editorElement.setSelectionRange(...cursorSelection);
    }

    for (const [configKey, [element, eventType, onElementChange]] of CONFIG_KEY_TO_ELEMENT) {
        initNumberInput(config, configKey, element, EDITOR_DEFAULTS);

        // Configure listener
        element.addEventListener(eventType, () => {
            const prevValue = config[configKey];
            const newValue = onElementChange();
            if (prevValue === newValue || Array.isArray(newValue) && _arraysEqual(prevValue, newValue)) {
                return;
            }

            config[configKey] = newValue;
            saveEditorConfigState();
        });
    }

    // Tokenize content
    state.tokenizer.tokenize(editorElement.value);
    redraw();
}

export function onResize(event) {
    event.preventDefault();

    dragging = true;
    startY = event.clientY;
    startHeight = editorPanelElement.offsetHeight;
    startMaxHeight = Math.round(window.innerHeight * EDITOR_MAX_HEIGHT_PERCENTAGE);

    document.body.style.userSelect = CSS_USER_SELECT.NONE;
    editorResizeHandleElement.classList.add(CSS.DRAG);
}

export function onEditorMouseMove(event) {
    if (!dragging) {
        return;
    }

    const newHeight = Math.max(EDITOR_MIN_HEIGHT_PX, _getHeight(event.clientY));
    const editorHeight = editorPanelElement.offsetHeight;
    if (
        newHeight === startMaxHeight &&
        editorHeight === startMaxHeight ||
        newHeight === EDITOR_MIN_HEIGHT_PX &&
        editorHeight === EDITOR_MIN_HEIGHT_PX
    ) {
        return;
    }

    editorPanelElement.style.height = toPx(newHeight);
    adjustCanvas();
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