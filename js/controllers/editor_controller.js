import {
    redraw
} from "./render_controller.js";

const resizeHandleElement = document.getElementById('rh');
const editorPanelElement = document.getElementById('ed-panel');

let dragging = false;
let startY = 0;
let startHeight = 0;

function onResize(event) {
    dragging = true;
    startY = event.clientY;
    startHeight = editorPanelElement.offsetHeight;
    resizeHandleElement.classList.add('drag');
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
    resizeHandleElement.classList.remove('drag');
    document.body.style.userSelect = '';
}

export {
    onEditorMouseMove,
    onEditorMouseUp,
    onResize
};