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
    sectionTypography
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    initNumberInput
} from '../utils/init.js';
import {
    camelToKebab,
    camelToTitle,
    parseNumber
} from '../utils/parse.js';
import {
    createSaveScheduler,
    saveTypographyConfigState
} from '../utils/persistence.js';
import {
    createNumberRow,
    renderSection
} from './section_renderer.js';

const _scheduleTypographyConfigSave = createSaveScheduler(saveTypographyConfigState);

export function initTypographySection(signal) {
    const config = state.typographyConfig;
    const rows = [];

    for (const [configKey, configValue] of Object.entries(TYPOGRAPHY_DEFAULTS)) {
        const elementID = `${CSS.TYPOGRAPHY}-${camelToKebab(configKey)}`;
        const [rowElement, inputElement] = createNumberRow(elementID, camelToTitle(configKey));

        rows.push(rowElement);

        // Init input
        initNumberInput(config, configKey, inputElement, TYPOGRAPHY_DEFAULTS);

        // Add listener
        inputElement.addEventListener(EVENTS.INPUT, () => {
            const value = inputElement.value;
            const fallback = configValue.value;

            config[configKey] = parseNumber(value, fallback);
            _scheduleTypographyConfigSave();

            redraw();
        }, {
            signal
        });
    }

    renderSection(sectionTypography, rows);
};
