import {
    CANVAS_CONTEXT_TYPE,
    CANVAS_DEFAULTS,
    config,
    DEFAULT_EXPORT_IMAGE_NAME,
    DEFAULT_EXPORT_SCALAR,
    IMAGE_BLOB_TYPE,
    IMAGES_EXTENSION,
    PROMPT_MESSAGE,
    PROMPT_SCALARS,
} from '../common/config.js';
import {
    createResolution,
    describeResolution
} from '../common/resolution_utils.js';
import {
    render
} from './render_controller.js';

const _DEFAULT_PROMPT_MESSAGE = `${PROMPT_MESSAGE}
${PROMPT_SCALARS
  .map(scalar => `    ${scalar} -> ${describeResolution(scalar)}`)
  .join("\n")}`;

function _createFilename(width, height) {
    return `${DEFAULT_EXPORT_IMAGE_NAME}-${createResolution(width, height)}${IMAGES_EXTENSION}`;
}

function _askScalar() {
    return prompt(_DEFAULT_PROMPT_MESSAGE, DEFAULT_EXPORT_SCALAR);
}

function _scaleConfig() {
    return {
        fontSize: config.fontSize,
        letterSpacing: config.letterSpacing,
        padX: config.padX,
        padY: config.padY,
    };
}

function _applyScaledConfig(scalar) {
    const snapshot = _scaleConfig();
    config.fontSize *= scalar;
    config.letterSpacing *= scalar;
    config.padX *= scalar;
    config.padY *= scalar;
    return snapshot;
}

function _restoreConfig(snapshot) {
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

    const snapshot = _applyScaledConfig(scalar);
    render(offscreen.getContext(CANVAS_CONTEXT_TYPE), exportWidth, exportHeight);
    _restoreConfig(snapshot);

    offscreen.toBlob(blob => {
        _downloadBlob(blob, _createFilename(exportWidth, exportHeight));
    }, IMAGE_BLOB_TYPE);
}

export {
    exportCanvas
};