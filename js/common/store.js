import {
    IncrementalTokenizer
} from '../core/tokenizer.js';
import {
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS,
    TYPOGRAPHY_DEFAULTS
} from './config.js';

export const state = {
    colors: {},
    themes: [],
    activeThemeName: '',
    activeElementId: '',
    collapsedSectionIds: {},
    tokenizer: new IncrementalTokenizer(),
    typographyConfig: {
        fontSize: TYPOGRAPHY_DEFAULTS.fontSize.value,
        lineHeight: TYPOGRAPHY_DEFAULTS.lineHeight.value,
        letterSpacing: TYPOGRAPHY_DEFAULTS.letterSpacing.value,
        padX: TYPOGRAPHY_DEFAULTS.padX.value,
        padY: TYPOGRAPHY_DEFAULTS.padY.value,
    },
    editorConfig: {
        cursorSelection: [],
        height: EDITOR_DEFAULTS.height,
        content: EDITOR_DEFAULTS.content,
        fontSize: EDITOR_DEFAULTS.fontSize.value,
    },
    canvasConfig: {
        zoom: CANVAS_DEFAULTS.zoom,
        panX: CANVAS_DEFAULTS.panX,
        panY: CANVAS_DEFAULTS.panY,
    }
};