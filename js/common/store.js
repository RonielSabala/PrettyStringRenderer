import {
    IncrementalTokenizer
} from '../core/tokenizer.js';
import {
    CANVAS_DEFAULTS,
    DEFAULT_THEME
} from './config.js';

export const state = {
    themes: [],
    activeThemeName: '',
    tokenizer: new IncrementalTokenizer(),
    colors: {
        ...DEFAULT_THEME
    },
    config: {
        fontSize: CANVAS_DEFAULTS.fontSize.value,
        lineHeight: CANVAS_DEFAULTS.lineHeight.value,
        letterSpacing: CANVAS_DEFAULTS.letterSpacing.value,
        padX: CANVAS_DEFAULTS.padX.value,
        padY: CANVAS_DEFAULTS.padY.value,
    },
};