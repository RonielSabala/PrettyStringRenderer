import {
    state
} from '../common/store.js';
import {
    roundUp
} from './parse.js';

export function toPx(amount) {
    return `${amount}px`;
}

export function createResolution(width, height) {
    return `${width}x${height}`;
}

export function getCanvasDimensions(scalar = null) {
    let {
        width,
        height
    } = state.canvasConfig;

    if (scalar !== null) {
        width = Math.round(scalar * width);
        height = Math.round(scalar * height);
    }

    return [width, height]
}

export function describeCanvasAspectRatio() {
    const [width, height] = getCanvasDimensions();
    return `${createResolution(width, height)} / ${roundUp(width/height)}:1`;
}
