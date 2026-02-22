import {
    canvasConfig,
    config,
    editorConfig,
} from "../common/config.js";

import {
    redraw
} from "./render_controller.js";

function onTypographyConfig() {
    config.fontSize = parseFloat(document.getElementById('c-fs').value) || canvasConfig.fontSize;
    config.lineHeight = parseFloat(document.getElementById('c-lh').value) || canvasConfig.lineHeight;
    config.letterSpacing = parseFloat(document.getElementById('c-ls').value) || canvasConfig.letterSpacing;
    config.canvasPadX = parseFloat(document.getElementById('c-px').value) || canvasConfig.canvasPadX;
    config.canvasPadY = parseFloat(document.getElementById('c-py').value) || canvasConfig.canvasPadY;
    redraw();
}

function onEditorFontSize() {
    const value = document.getElementById('ed-fs').value;
    const size = parseFloat(value) || editorConfig.fontSize;
    document.getElementById('ed').style.fontSize = size + 'px';
}

export {
    onEditorFontSize,
    onTypographyConfig
};