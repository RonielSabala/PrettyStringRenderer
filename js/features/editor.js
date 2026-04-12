import {
    adjustCanvas,
    redraw
} from '../canvas/buffer.js';
import {
    APP_FONT_VARIANT_LIGATURES,
    EDITOR_DEFAULTS,
    EDITOR_LETTER_SPACING,
    EDITOR_LINE_HEIGHT,
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
    canvasWrapElement,
    editorElement,
    editorFontSizeElement,
    editorPanelElement,
    editorResizeHandleElement
} from '../common/elements.js';
import {
    matchesKeybinding
} from '../common/keybindings.js';
import {
    state,
    tokenizer
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
const CONFIG_KEYS_TO_ELEMENT_CALLBACKS = [
    ['height', [document, EVENTS.MOUSE_MOVE, _onEditorMouseMove]],
    ['height', [editorResizeHandleElement, EVENTS.DBL_CLICK, _onResizeReset]],
    ['content', [editorElement, EVENTS.INPUT, _onEditorContentChange]],
    ['fontSize', [editorFontSizeElement, EVENTS.INPUT, _onEditorFontSize]],
    ['cursorSelection', [editorElement, EVENTS.CLICK, _onEditorCursorChange]],
    ['cursorSelection', [editorElement, EVENTS.KEY_UP, _onEditorCursorChange]],
];

// Helpers

function _getEditorHeight() {
    return editorPanelElement.offsetHeight;
}

function _setEditorHeight(newHeight) {
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

// Listeners

function _onEditorContentChange() {
    const content = editorElement.value;
    tokenizer.tokenize(content);
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

    const editorHeight = _getEditorHeight();
    const newHeight = Math.max(EDITOR_MIN_HEIGHT_PX, _getNormalizedHeight(event.clientY));
    if (
        newHeight === startMaxHeight &&
        editorHeight === startMaxHeight ||
        newHeight === EDITOR_MIN_HEIGHT_PX &&
        editorHeight === EDITOR_MIN_HEIGHT_PX
    ) {
        return;
    }

    _setEditorHeight(newHeight);
    adjustCanvas();

    return newHeight
}

function _onResizeReset() {
    let newHeight = EDITOR_DEFAULTS.height;
    if (newHeight === _getEditorHeight()) {
        newHeight = EDITOR_MIN_HEIGHT_PX;
    }

    _setEditorHeight(newHeight);
    adjustCanvas();

    return newHeight;
}

function _onResize(event) {
    event.preventDefault();

    dragging = true;
    startY = event.clientY;
    startHeight = _getEditorHeight();
    startMaxHeight = Math.round(window.innerHeight * EDITOR_MAX_HEIGHT_PERCENTAGE);

    document.body.style.userSelect = CSS_USER_SELECT.NONE;
    editorResizeHandleElement.classList.add(CSS.DRAG);
}

function _onDraggingRelease() {
    if (!dragging) {
        return;
    }

    dragging = false;
    document.body.style.userSelect = CSS_USER_SELECT.AUTO;
    editorResizeHandleElement.classList.remove(CSS.DRAG);
}

function _onCanvasFocus(event) {
    if (!matchesKeybinding(event, 'canvas.focus')) {
        return;
    }

    event.preventDefault();
    canvasWrapElement.focus();
}

// Public methods

export function initEditorSection(signal) {
    const config = state.editorConfig;
    const editorStyle = editorElement.style;

    // Set editor values
    editorElement.scrollTop = 0;
    editorElement.value = config.content ?? EDITOR_DEFAULTS.content;
    editorStyle.padding = `${toPx(EDITOR_DEFAULTS.padX)} ${toPx(EDITOR_DEFAULTS.padY)}`;
    editorStyle.fontSize = toPx(config.fontSize);
    editorStyle.lineHeight = EDITOR_LINE_HEIGHT;
    editorStyle.letterSpacing = EDITOR_LETTER_SPACING;
    editorStyle.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;

    // Restore editor height
    _setEditorHeight(config.height);

    // Restore cursor selection
    const cursorSelection = config.cursorSelection;
    if (cursorSelection.length > 0) {
        editorElement.setSelectionRange(...cursorSelection);
    }

    // Init editor inputs
    for (const [configKey, [element, eventType, callback]] of CONFIG_KEYS_TO_ELEMENT_CALLBACKS) {
        initNumberInput(config, configKey, element, EDITOR_DEFAULTS);

        element.addEventListener(eventType, (event) => {
            const newValue = callback(event);
            if (newValue === undefined) {
                return;
            }

            const prevValue = config[configKey];
            if (prevValue === newValue || Array.isArray(newValue) && _arraysEqual(prevValue, newValue)) {
                return;
            }

            config[configKey] = newValue;
            _scheduleEditorConfigSave();
        }, {
            signal
        });
    }

    // Listeners
    editorResizeHandleElement.addEventListener(EVENTS.MOUSE_DOWN, _onResize, {
        signal
    });
    document.addEventListener(EVENTS.MOUSE_UP, _onDraggingRelease, {
        signal
    });
    document.addEventListener(EVENTS.KEY_DOWN, _onCanvasFocus, {
        signal
    })
}
