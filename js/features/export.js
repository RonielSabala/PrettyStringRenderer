import {
    iterateTokens,
    render
} from '../canvas/renderer.js';
import {
    CANVAS_CONTEXT_TYPE,
    CANVAS_DEFAULTS,
    CANVAS_FONT,
    CANVAS_FONT_WEIGHT,
    DEFAULT_EXPORT_IMAGE_FILENAME,
    DEFAULT_PNG_SCALAR,
    EXPORT_PNG_PROMPT_MESSAGE,
    EXPORT_PNG_PROMPT_SCALAR_EXAMPLES,
    LINE_BREAK,
    PNG_BLOB_TYPE,
    PNG_EXTENSION,
    SVG_BLOB_TYPE,
    SVG_EXTENSION,
    SVG_FONT_VARIANT_LIGATURES,
    SVG_NS
} from '../common/config.js';
import {
    EVENTS
} from '../common/constants/events.js';
import {
    KEYS
} from '../common/constants/keys.js';
import {
    btnExport,
    btnExportPNG,
    btnExportSVG,
    exportDialogElement,
} from '../common/elements.js';
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

const _SCALAR_PROMPT_MESSAGE = `${EXPORT_PNG_PROMPT_MESSAGE}
${EXPORT_PNG_PROMPT_SCALAR_EXAMPLES
    .map(scalar => `    ${scalar} -> ${describeResolution(scalar)}`)
    .join(LINE_BREAK)
}`;

// Helpers

function _closeDialog() {
    exportDialogElement.close();
}

function _createFilename(width, height, ext) {
    return `${DEFAULT_EXPORT_IMAGE_FILENAME}-${createResolution(width, height)}${ext}`;
}

function _download(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// PNG exporter

function _exportPNG() {
    const scalar = parseNumber(prompt(_SCALAR_PROMPT_MESSAGE, DEFAULT_PNG_SCALAR), 0);
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

    render(offscreen.getContext(CANVAS_CONTEXT_TYPE), exportWidth, exportHeight, scaledConfig);
    offscreen.toBlob(blob => {
        _download(blob, _createFilename(exportWidth, exportHeight, PNG_EXTENSION));
    }, PNG_BLOB_TYPE);
}

// SVG exporter

function _createSVGElement(tag) {
    return document.createElementNS(SVG_NS, tag);
}

function _buildSVG(width, height) {
    const config = state.typographyConfig;
    const svg = _createSVGElement('svg');

    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Add background
    const rect = _createSVGElement('rect');
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', state.colors.background);
    svg.appendChild(rect);

    // Add tokens

    const group = _createSVGElement('g');
    group.setAttribute('font-family', CANVAS_FONT);
    group.setAttribute('font-size', config.fontSize);
    group.setAttribute('font-weight', CANVAS_FONT_WEIGHT);
    group.setAttribute('letter-spacing', config.letterSpacing);
    svg.appendChild(group);

    iterateTokens(width, height, config, (text, color, x, y) => {
        const element = _createSVGElement('text');

        element.textContent = text;
        element.style.fontVariantLigatures = SVG_FONT_VARIANT_LIGATURES;

        element.setAttribute('x', x.toFixed(3));
        element.setAttribute('y', y.toFixed(3));
        element.setAttribute('fill', color);

        group.appendChild(element);
    });

    return svg.outerHTML;
}

function _exportSVG() {
    const width = CANVAS_DEFAULTS.width;
    const height = CANVAS_DEFAULTS.height;
    const svg = _buildSVG(width, height);
    const blob = new Blob([svg], SVG_BLOB_TYPE);
    _download(blob, _createFilename(width, height, SVG_EXTENSION));
}

// Listeners

function _onClickExportCanvas() {
    exportDialogElement.showModal();
}

function _onKeyDownExportCanvas(event) {
    if (!event.ctrlKey || event.code !== KEYS.S) {
        return;
    }

    event.preventDefault();
    _onClickExportCanvas();
}

function _onDialogClose(event) {
    if (event.target === exportDialogElement || event.code === KEYS.ESCAPE) {
        _closeDialog();
    }
}

function _onExportPNG() {
    _closeDialog();
    _exportPNG();
}

function _onExportSVG() {
    _closeDialog();
    _exportSVG();
}

// Public methods

export function initExport() {
    btnExport.addEventListener(EVENTS.CLICK, _onClickExportCanvas);
    document.addEventListener(EVENTS.KEY_DOWN, _onKeyDownExportCanvas);
    exportDialogElement.addEventListener(EVENTS.CLICK, _onDialogClose);
    exportDialogElement.addEventListener(EVENTS.KEY_DOWN, _onDialogClose);
    btnExportPNG.addEventListener(EVENTS.CLICK, _onExportPNG);
    btnExportSVG.addEventListener(EVENTS.CLICK, _onExportSVG);
}