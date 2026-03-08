import {
    render
} from '../canvas/renderer.js';
import {
    CANVAS_CONTEXT_TYPE,
    CANVAS_DEFAULTS,
    DEFAULT_EXPORT_IMAGE_FILENAME,
    DEFAULT_EXPORT_SCALAR,
    EXPORT_IMAGE_PROMPT_MESSAGE,
    EXPORT_IMAGE_PROMPT_SCALAR_EXAMPLES,
    IMAGE_BLOB_TYPE,
    IMAGES_EXTENSION,
    LINE_BREAK
} from '../common/config.js';
import {
    state
} from '../common/store.js';
import {
    parseNumber
} from '../utils/parse.js';
import {
    createResolution,
    describeResolution
} from '../utils/resolution.js';

const _DEFAULT_PROMPT_MESSAGE = `${EXPORT_IMAGE_PROMPT_MESSAGE}
${EXPORT_IMAGE_PROMPT_SCALAR_EXAMPLES
  .map(scalar => `    ${scalar} -> ${describeResolution(scalar)}`)
  .join(LINE_BREAK)
}`;

function _createFilename(width, height) {
    return `${DEFAULT_EXPORT_IMAGE_FILENAME}-${createResolution(width, height)}${IMAGES_EXTENSION}`;
}

function _askScalar() {
    return prompt(_DEFAULT_PROMPT_MESSAGE, DEFAULT_EXPORT_SCALAR);
}

function _downloadBlob(blob, filename) {
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
}

export function exportCanvas() {
    const scalar = parseNumber(_askScalar(), 0);
    if (scalar <= 0) {
        return;
    }

    const config = state.typographyConfig;
    const scaledConfig = {
        ...config,
        fontSize: config.fontSize * scalar,
        letterSpacing: config.letterSpacing * scalar,
        padX: config.padX * scalar,
        padY: config.padY * scalar,
    };

    const exportWidth = Math.round(scalar * CANVAS_DEFAULTS.width);
    const exportHeight = Math.round(scalar * CANVAS_DEFAULTS.height);

    const offscreen = document.createElement('canvas');
    offscreen.width = exportWidth;
    offscreen.height = exportHeight;

    render(
        offscreen.getContext(CANVAS_CONTEXT_TYPE),
        exportWidth,
        exportHeight,
        scaledConfig
    );

    offscreen.toBlob(blob => {
        _downloadBlob(blob, _createFilename(exportWidth, exportHeight));
    }, IMAGE_BLOB_TYPE);
}