import {
    redraw
} from '../canvas/buffer.js';
import {
    TYPOGRAPHY_DEFAULTS
} from '../common/config.js';
import {
    CSS
} from '../common/constants/css.js';
import {
    EVENTS
} from '../common/constants/events.js';
import {
    getElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    initNumberInput
} from '../utils/init.js';
import {
    camelToKebab,
    parseNumber
} from '../utils/parse.js';
import {
    createSaveScheduler,
    saveTypographyConfigState
} from '../utils/persistence.js';

const _scheduleTypographyConfigSave = createSaveScheduler(saveTypographyConfigState);

export function initTypographySection(signal) {
    const config = state.typographyConfig;

    for (const configKey of Object.keys(TYPOGRAPHY_DEFAULTS)) {
        const element = getElement(`${CSS.TYPOGRAPHY}-${camelToKebab(configKey)}`);

        initNumberInput(config, configKey, element, TYPOGRAPHY_DEFAULTS);

        // Configure listener
        element.addEventListener(EVENTS.INPUT, () => {
            const value = element.value;
            const fallback = TYPOGRAPHY_DEFAULTS[configKey].value;

            config[configKey] = parseNumber(value, fallback);
            _scheduleTypographyConfigSave();
            redraw();
        }, {
            signal
        });
    }
};