import {
    redraw
} from '../canvas/buffer.js';
import {
    DEFAULT_THEME
} from '../common/config.js';
import {
    EVENTS
} from '../common/constants/events.js';
import {
    getColorPickerElement,
    getHexInputElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    setColor,
    updateTokensColor
} from '../utils/color_sync.js';
import {
    createSaveScheduler,
    saveColorsState
} from '../utils/persistence.js';

const _scheduleColorSave = createSaveScheduler(saveColorsState);

// Private helpers

function _updateColor(themeKey, value, depth) {
    let themeValue;
    if (depth === null) {
        themeValue = value;
    } else {
        themeValue = state.colors[themeKey].with(depth, value);
    }

    setColor(themeKey, themeValue);
    _scheduleColorSave();
    updateTokensColor(themeKey);
    redraw();
}

// Public methods

export function initColors(signal) {
    // Add listeners
    for (const [themeKey, themeValue] of Object.entries(DEFAULT_THEME)) {
        const multipleValues = Array.isArray(themeValue);
        const maxIndex = multipleValues ? themeValue.length : 1;

        for (let i = 0; i < maxIndex; i++) {
            const depth = multipleValues ? i : null;
            const HTMLElementID = themeKey + (multipleValues ? `${i}` : '');

            // Color Picker
            getColorPickerElement(HTMLElementID).addEventListener(EVENTS.INPUT, (event) => {
                _updateColor(themeKey, event.target.value, depth);
            }, {
                signal
            });

            // Hex Input
            getHexInputElement(HTMLElementID).addEventListener(EVENTS.INPUT, (event) => {
                const value = event.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    _updateColor(themeKey, value, depth);
                }
            }, {
                signal
            });
        }
    }
}