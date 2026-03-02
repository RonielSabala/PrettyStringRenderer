import {
    CANVAS_DEFAULTS
} from './config.js';

export function createResolution(width, height) {
    return `${width}x${height}`;
}

export function describeResolution(scalar = 1) {
    const width = Math.round(scalar * CANVAS_DEFAULTS.width);
    const height = Math.round(scalar * CANVAS_DEFAULTS.height);
    return createResolution(width, height);
}