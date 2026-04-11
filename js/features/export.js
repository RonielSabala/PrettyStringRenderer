import {
    getDrawingContext,
    iterateTokens,
    render
} from '../canvas/renderer.js';
import {
    APP_FONT_VARIANT_LIGATURES,
    CANVAS_DEFAULTS,
    DEFAULT_EXPORT_IMAGE_FILENAME,
    DEFAULT_PNG_SCALAR,
    EXPORT_PNG_PROMPT_MESSAGE,
    EXPORT_PNG_PROMPT_SCALAR_EXAMPLES,
    LINE_BREAK,
    PNG_BLOB_TYPE,
    PNG_EXTENSION,
    SVG_BLOB_TYPE,
    SVG_EXTENSION,
    SVG_NS
} from '../common/config.js';
import {
    CSS_TEXT_RENDERING
} from '../common/constants/css.js';
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
    exportDialogElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    parseNumber,
    roundUp
} from '../utils/parse.js';
import {
    createResolution,
    getCanvasDimensions
} from '../utils/resolution.js';

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
    const scalarPromptMessage = `${EXPORT_PNG_PROMPT_MESSAGE}
    ${EXPORT_PNG_PROMPT_SCALAR_EXAMPLES
        .map(scalar => `    ${scalar} -> ${createResolution(...getCanvasDimensions(scalar))}`)
        .join(LINE_BREAK)
    }`;

    const scalar = parseNumber(prompt(scalarPromptMessage, DEFAULT_PNG_SCALAR), 0);
    if (scalar <= 0) {
        return;
    }

    const config = state.typographyConfig;
    const scaledConfig = {
        ...config,
        fontSize: config.fontSize * scalar,
        letterSpacing: config.letterSpacing * scalar,
        textRendering: CSS_TEXT_RENDERING.GEOMETRIC_PRECISION,
        padX: config.padX * scalar,
        padY: config.padY * scalar,
    };

    const [exportWidth, exportHeight] = getCanvasDimensions(scalar);
    const offscreen = document.createElement('canvas');
    const offscreenStyle = offscreen.style;

    // Temporarily append to DOM to ensure the context inherits the styles
    document.body.appendChild(offscreen);
    offscreen.width = exportWidth;
    offscreen.height = exportHeight;
    offscreenStyle.visibility = 'hidden';
    offscreenStyle.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;

    render(getDrawingContext(offscreen), exportWidth, exportHeight, scaledConfig);

    offscreen.toBlob(blob => {
        _download(blob, _createFilename(exportWidth, exportHeight, PNG_EXTENSION));
        document.body.removeChild(offscreen);
    }, PNG_BLOB_TYPE);
}

// SVG exporter

function _setAttrs(element, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
        element.setAttribute(key, value);
    };

    return element;
};

function _createElement(tag) {
    return document.createElementNS(SVG_NS, tag);
}

function _createText({
    text,
    x,
    y
}) {
    const element = _createElement('text');
    element.textContent = text;
    return _setAttrs(element, {
        x: roundUp(x),
        y: roundUp(y)
    });
};

function _buildSVG(width, height) {
    const config = state.typographyConfig;
    const renderConfig = {
        ...config,
        textRendering: CSS_TEXT_RENDERING.GEOMETRIC_PRECISION,
    };

    const svgElement = _setAttrs(_createElement('svg'), {
        xmlns: SVG_NS,
        width,
        height,
        viewBox: `0 0 ${width} ${height}`
    });

    const pathElement = _setAttrs(_createElement('path'), {
        fill: state.colors.background,
        d: `M0 0h${width}v${height}H0z`
    });

    const groupElement = _setAttrs(_createElement('g'), {
        'font-size': config.fontSize,
        'font-family': CANVAS_DEFAULTS.font,
        'font-weight': CANVAS_DEFAULTS.fontWeight,
        'letter-spacing': config.letterSpacing
    });

    groupElement.style.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;
    svgElement.append(pathElement, groupElement);

    const batch = new Map();
    iterateTokens(width, height, renderConfig, (text, color, x, y) => {
        if (!batch.has(color)) {
            batch.set(color, []);
        }

        batch.get(color).push({
            text,
            color,
            x,
            y,
        });
    });

    for (const [color, calls] of batch) {
        const isSingle = calls.length === 1;
        const container = isSingle ? _createText(calls[0]) : _createElement('g');

        container.setAttribute('fill', color);
        if (!isSingle) {
            container.append(...calls.map(_createText));
        }

        groupElement.appendChild(container);
    }

    return svgElement.outerHTML;
}

function _exportSVG() {
    const [width, height] = getCanvasDimensions();
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

export function initExport(signal) {
    btnExport.addEventListener(EVENTS.CLICK, _onClickExportCanvas, {
        signal
    });
    document.addEventListener(EVENTS.KEY_DOWN, _onKeyDownExportCanvas, {
        signal
    });
    exportDialogElement.addEventListener(EVENTS.CLICK, _onDialogClose, {
        signal
    });
    exportDialogElement.addEventListener(EVENTS.KEY_DOWN, _onDialogClose, {
        signal
    });
    btnExportPNG.addEventListener(EVENTS.CLICK, _onExportPNG, {
        signal
    });
    btnExportSVG.addEventListener(EVENTS.CLICK, _onExportSVG, {
        signal
    });
}
