import {
    canvasWrapElement,
    editorPanelElement,
    editorResizeHandleElement
} from '../common/elements.js';
import {
    redraw
} from "./render_controller.js";

let dragging = false;
let startY = 0;
let startHeight = 0;

function onResize(event) {
    dragging = true;
    startY = event.clientY;
    startHeight = editorPanelElement.offsetHeight;
    editorResizeHandleElement.classList.add('drag');
    document.body.style.userSelect = 'none';
    event.preventDefault();
}

function onEditorMouseMove(event) {
    if (!dragging) {
        return;
    }

    const newHeight = Math.max(55, Math.min(window.innerHeight * 0.8, startHeight + (startY - event.clientY)));
    editorPanelElement.style.height = `${newHeight}px`;
    redraw();
}

function onEditorMouseUp() {
    if (!dragging) {
        return;
    }

    dragging = false;
    editorResizeHandleElement.classList.remove('drag');
    document.body.style.userSelect = '';
}

function onEscape(event) {
    if (event.code !== 'Escape') {
        return;
    }

    console.log("HI")
    event.preventDefault();
    canvasWrapElement.focus();
}

export {
    onEditorMouseMove,
    onEditorMouseUp,
    onEscape,
    onResize
};