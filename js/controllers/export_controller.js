import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    config
} from '../common/config.js';
import {
    getTokenLines,
    render
} from './render_controller.js';

function _createResolution(width, height) {
    return `${width}x${height}`;
}

function _createFilename(width, height) {
    return `pretty-string-${_createResolution(width, height)}.png`;
}

function _describeResolution(scalar) {
    const width = Math.round(scalar * CANVAS_WIDTH);
    const height = Math.round(scalar * CANVAS_HEIGHT);
    return _createResolution(width, height);
}

function _promptScalar() {
    return prompt(
        `Scale multiplier:\n` +
        `  1   → ${_describeResolution(1)}\n` +
        `  2   → ${_describeResolution(2)}\n` +
        `  0.5 → ${_describeResolution(0.5)}`,
        '1'
    );
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
    const rawInput = _promptScalar();
    if (rawInput === null) {
        return;
    }

    const scalar = parseFloat(rawInput);
    if (isNaN(scalar) || scalar <= 0) {
        return;
    }

    const exportWidth = Math.round(CANVAS_WIDTH * scalar);
    const exportHeight = Math.round(CANVAS_HEIGHT * scalar);

    await document.fonts.ready;

    const offscreen = document.createElement('canvas');
    offscreen.width = exportWidth;
    offscreen.height = exportHeight;

    const snapshot = _applyScaledConfig(scalar);
    render(offscreen.getContext('2d'), getTokenLines(), exportWidth, exportHeight);
    _restoreConfig(snapshot);

    offscreen.toBlob(blob => {
        _downloadBlob(blob, _createFilename(exportWidth, exportHeight));
    }, 'image/png');
}

export {
    exportCanvas
};