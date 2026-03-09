import {
    IncrementalTokenizer
} from '../core/tokenizer.js';
import {
    APP_FONT_VARIANT_LIGATURES,
    CANVAS_DEFAULTS,
    EDITOR_DEFAULTS,
    TYPOGRAPHY_DEFAULTS
} from './config.js';
import {
    CSS_FONT_VARIANT_LIGATURES,
    CSS_TEXT_RENDERING
} from './constants/css.js';

export const state = {
    colors: {},
    themes: [],
    activeThemeName: '',
    activeElementId: '',
    collapsedSectionIds: {},
    typographyConfig: {
        fontSize: TYPOGRAPHY_DEFAULTS.fontSize.value,
        lineHeight: TYPOGRAPHY_DEFAULTS.lineHeight.value,
        letterSpacing: TYPOGRAPHY_DEFAULTS.letterSpacing.value,
        textRendering: APP_FONT_VARIANT_LIGATURES === CSS_FONT_VARIANT_LIGATURES.NONE ? CSS_TEXT_RENDERING.OPTIMIZE_SPEED : CSS_TEXT_RENDERING.OPTIMIZE_LEGIBILITY,
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
    },
    tokenizer: new IncrementalTokenizer(),
};