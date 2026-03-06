import {
    IncrementalTokenizer
} from '../core/tokenizer.js';
import {
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS
} from './config.js';

export const state = {
    colors: {},
    themes: [],
    activeThemeName: '',
    activeElementId: '',
    collapsedSectionIds: {},
    tokenizer: new IncrementalTokenizer(),
    config: {
        fontSize: CANVAS_DEFAULTS.fontSize.value,
        lineHeight: CANVAS_DEFAULTS.lineHeight.value,
        letterSpacing: CANVAS_DEFAULTS.letterSpacing.value,
        padX: CANVAS_DEFAULTS.padX.value,
        padY: CANVAS_DEFAULTS.padY.value,
    },
    editorConfig: {
        cursorSelection: [],
        content: EDITOR_DEFAULTS.content,
        fontSize: EDITOR_DEFAULTS.fontSize.value,
    },
};