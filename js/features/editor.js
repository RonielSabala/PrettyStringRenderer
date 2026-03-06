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
    createSaveScheduler,
    saveEditorConfigState
} from '../utils/persistence.js';
import {
    toPx
} from '../utils/resolution.js';

let dragging = false;
let startY = 0;
let startHeight = 0;
let startMaxHeight = 0;

const _scheduleEditorConfigSave = createSaveScheduler(saveEditorConfigState);

const CONFIG_KEYS_TO_ELEMENT = [
    ['height', [document, EVENTS.MOUSE_MOVE, _onEditorMouseMove]],
    ['height', [editorResizeHandleElement, EVENTS.DBL_CLICK, _onResizeReset]],
    ['content', [editorElement, EVENTS.INPUT, _onEditorContentChange]],
    ['fontSize', [editorFontSizeElement, EVENTS.INPUT, _onEditorFontSize]],
    ['cursorSelection', [editorElement, EVENTS.CLICK, _onEditorCursorChange]],
    ['cursorSelection', [editorElement, EVENTS.KEY_UP, _onEditorCursorChange]],
];

function _getHeight() {
    return editorPanelElement.offsetHeight;
}

function _setHeight(newHeight) {
    editorPanelElement.style.height = toPx(newHeight);
}

function _getNormalizedHeight(y) {
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

function _onEditorMouseMove(event) {
    if (!dragging) {
        return;
    }

    const editorHeight = _getHeight();
    const newHeight = Math.max(EDITOR_MIN_HEIGHT_PX, _getNormalizedHeight(event.clientY));
    if (
        newHeight === startMaxHeight &&
        editorHeight === startMaxHeight ||
        newHeight === EDITOR_MIN_HEIGHT_PX &&
        editorHeight === EDITOR_MIN_HEIGHT_PX
    ) {
        return;
    }

    _setHeight(newHeight);
    adjustCanvas();

    return newHeight
}

function _onResizeReset() {
    const defaultHeight = EDITOR_DEFAULTS.height;
    _setHeight(defaultHeight);
    adjustCanvas();

    return defaultHeight;
}

export function onResize(event) {
    event.preventDefault();

    dragging = true;
    startY = event.clientY;
    startHeight = _getHeight();
    startMaxHeight = Math.round(window.innerHeight * EDITOR_MAX_HEIGHT_PERCENTAGE);

    document.body.style.userSelect = CSS_USER_SELECT.NONE;
    editorResizeHandleElement.classList.add(CSS.DRAG);
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

export function initEditorSection() {
    const config = state.editorConfig;

    // Configure editor

    updateZoomInfo();
    _setHeight(config.height);

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

    for (const [configKey, [element, eventType, onElementChange]] of CONFIG_KEYS_TO_ELEMENT) {
        initNumberInput(config, configKey, element, EDITOR_DEFAULTS);

        // Configure listener
        element.addEventListener(eventType, (event) => {
            const newValue = onElementChange(event);
            if (newValue === undefined) {
                return;
            }

            const prevValue = config[configKey];
            if (prevValue === newValue || Array.isArray(newValue) && _arraysEqual(prevValue, newValue)) {
                return;
            }

            config[configKey] = newValue;
            _scheduleEditorConfigSave();
        });
    }

    // Tokenize content
    state.tokenizer.tokenize(editorElement.value);
    redraw();
}