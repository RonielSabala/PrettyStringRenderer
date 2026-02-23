import {
    config,
    OUT_HEIGHT,
    OUT_WIDTH
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
    const width = Math.round(scalar * OUT_WIDTH);
    const height = Math.round(scalar * OUT_HEIGHT);
    return _createResolution(width, height)
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

function exportCanvas() {
    const scalar = parseFloat(_promptScalar());
    if (isNaN(scalar) || scalar <= 0) {
        return;
    }

    const exportWidth = Math.round(OUT_WIDTH * scalar);
    const exportHeight = Math.round(OUT_HEIGHT * scalar);

    const offscreen = document.createElement('canvas');
    offscreen.width = exportWidth;
    offscreen.height = exportHeight;

    const temp = {
        fontSize: config.fontSize,
        letterSpacing: config.letterSpacing,
        padX: config.padX,
        padY: config.padY,
    };

    config.fontSize *= scalar;
    config.letterSpacing *= scalar;
    config.padX *= scalar;
    config.padY *= scalar;

    render(offscreen.getContext('2d'), getTokenLines(), exportWidth, exportHeight);

    // Restore config
    config.fontSize = temp.fontSize;
    config.letterSpacing = temp.letterSpacing;
    config.padX = temp.padX;
    config.padY = temp.padY;

    offscreen.toBlob(blob => {
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = _createFilename(exportWidth, exportHeight);
        anchor.click();
        URL.revokeObjectURL(anchor.href);
    }, 'image/png');
}

export {
    exportCanvas
};