import {
    config,
    OUT_HEIGHT,
    OUT_WIDTH
} from "./config.js";
import {
    render,
    tokenLines,
} from "./render_controller.js";

function _buildImageFilename(width, height) {
    return `pretty-string-${width}x${height}.png`;
}

function _getScaledResolution(scalar) {
    let width = scalar * OUT_WIDTH;
    let height = scalar * OUT_HEIGHT;
    return `${width}x${height}`
}

function _askScalar() {
    return prompt(`Scale multiplier:\n  1  → ${_getScaledResolution(1)}\n  2  → ${_getScaledResolution(2)}\n  0.5 → ${_getScaledResolution(0.5)}`, '1')
}

function doExport() {
    const scalar = parseFloat(_askScalar());
    if (isNaN(scalar) || scalar <= 0) {
        return;
    }

    const WIDTH = Math.round(OUT_WIDTH * scalar);
    const HEIGHT = Math.round(OUT_HEIGHT * scalar);

    const off = document.createElement('canvas');
    off.width = WIDTH;
    off.height = HEIGHT;

    // Scale config measurements for the off-screen canvas
    const prevConfigValues = {
        fontSize: config.fontSize,
        letterSpacing: config.letterSpacing,
        canvasPadX: config.canvasPadX,
        canvasPadY: config.canvasPadY
    };

    config.fontSize *= scalar;
    config.letterSpacing *= scalar;
    config.canvasPadX *= scalar;
    config.canvasPadY *= scalar;

    render(off.getContext('2d'), tokenLines, WIDTH, HEIGHT);

    config.fontSize = prevConfigValues.fontSize;
    config.letterSpacing = prevConfigValues.letterSpacing;
    config.canvasPadX = prevConfigValues.canvasPadX;
    config.canvasPadY = prevConfigValues.canvasPadY;

    off.toBlob(blob => {
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = _buildImageFilename(WIDTH, HEIGHT);
        anchor.click();

        URL.revokeObjectURL(anchor.href);
    }, 'image/png');
}


export {
    doExport
};