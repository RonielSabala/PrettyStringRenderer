import {
    redraw
} from '../canvas/buffer.js';
import {
    CANVAS_DEFAULTS
} from '../common/config.js';
import {
    EVENTS
} from '../common/constants/events.js';
import {
    typographyFontSizeElement,
    typographyLetterSpacingElement,
    typographyLineHeightElement,
    typographyPadXElement,
    typographyPadYElement
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
    saveConfigState
} from '../utils/persistence.js';

const CONFIG_KEY_TO_ELEMENT = {
    'fontSize': typographyFontSizeElement,
    'lineHeight': typographyLineHeightElement,
    'letterSpacing': typographyLetterSpacingElement,
    'padX': typographyPadXElement,
    'padY': typographyPadYElement,
}

export function initTypographySection() {
    const config = state.config;

    for (const [configKey, element] of Object.entries(CONFIG_KEY_TO_ELEMENT)) {
        initNumberInput(config, configKey, element, CANVAS_DEFAULTS);

        // Configure listener
        element.addEventListener(EVENTS.INPUT, () => {
            const value = CONFIG_KEY_TO_ELEMENT[configKey].value;
            const fallback = CANVAS_DEFAULTS[configKey].value;

            config[configKey] = parseNumber(value, fallback);
            saveConfigState();
            redraw();
        });
    }
};