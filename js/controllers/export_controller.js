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
    createResolution,
    describeResolution
} from '../common/resolution_utils.js';
import {
    state
} from '../common/store.js';
import {
    render
} from './render_controller.js';

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

function _scaleConfig() {
    const config = state.config;
    return {
        fontSize: config.fontSize,
        letterSpacing: config.letterSpacing,
        padX: config.padX,
        padY: config.padY,
    };
}

function _saveConfig(scalar) {
    const config = state.config;
    const snapshot = _scaleConfig();

    config.fontSize *= scalar;
    config.letterSpacing *= scalar;
    config.padX *= scalar;
    config.padY *= scalar;

    return snapshot;
}

function _restoreConfig(snapshot) {
    const config = state.config;
    config.fontSize = snapshot.fontSize;
    config.letterSpacing = snapshot.letterSpacing;
    config.padX = snapshot.padX;
    config.padY = snapshot.padY;
}

function _downloadBlob(blob, filename) {
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
}

async function exportCanvas() {
    const rawInput = _askScalar();
    if (rawInput === null) {
        return;
    }

    const scalar = parseFloat(rawInput);
    if (isNaN(scalar) || scalar <= 0) {
        return;
    }

    const exportWidth = Math.round(scalar * CANVAS_DEFAULTS.width);
    const exportHeight = Math.round(scalar * CANVAS_DEFAULTS.height);

    await document.fonts.ready;

    const offscreen = document.createElement('canvas');
    offscreen.width = exportWidth;
    offscreen.height = exportHeight;

    const snapshot = _saveConfig(scalar);
    render(offscreen.getContext(CANVAS_CONTEXT_TYPE), exportWidth, exportHeight);
    _restoreConfig(snapshot);

    offscreen.toBlob(blob => {
        _downloadBlob(blob, _createFilename(exportWidth, exportHeight));
    }, IMAGE_BLOB_TYPE);
}

export {
    exportCanvas
};