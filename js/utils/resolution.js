import {
    CANVAS_DEFAULTS
} from '../common/config.js';
import {
    roundUp
} from './parse.js';

export function toPx(amount) {
    return `${amount}px`;
}

export function createResolution(width, height) {
    return `${width}x${height}`;
}

export function describeResolution(scalar = 1) {
    const width = Math.round(scalar * CANVAS_DEFAULTS.width);
    const height = Math.round(scalar * CANVAS_DEFAULTS.height);
    return createResolution(width, height);
}

export function describeAspectRatio() {
    return `${describeResolution()} · ${roundUp(CANVAS_DEFAULTS.aspectRatio)}:1`;
}