import {
    redraw
} from '../canvas/buffer.js';
import {
    TYPOGRAPHY_DEFAULTS
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
    saveTypographyConfigState
} from '../utils/persistence.js';

const CONFIG_KEYS_TO_ELEMENT = {
    'fontSize': typographyFontSizeElement,
    'lineHeight': typographyLineHeightElement,
    'letterSpacing': typographyLetterSpacingElement,
    'padX': typographyPadXElement,
    'padY': typographyPadYElement,
}

export function initTypographySection() {
    const config = state.typographyConfig;

    for (const [configKey, element] of Object.entries(CONFIG_KEYS_TO_ELEMENT)) {
        initNumberInput(config, configKey, element, TYPOGRAPHY_DEFAULTS);

        // Configure listener
        element.addEventListener(EVENTS.INPUT, () => {
            const value = element.value;
            const fallback = TYPOGRAPHY_DEFAULTS[configKey].value;

            config[configKey] = parseNumber(value, fallback);
            saveTypographyConfigState();
            redraw();
        });
    }
};