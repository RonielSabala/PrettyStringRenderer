import {
    editorStatusElement,
    resolutionBadgeElement
} from "../common/elements";
import {
    state
} from "../common/store";
import {
    describeCanvasAspectRatio
} from "./resolution";

export function updateResolutionBadge() {
    resolutionBadgeElement.textContent = describeCanvasAspectRatio();
}

export function updateEditorZoomInfo() {
    const zoom = (state.canvasConfig.zoom * 100).toFixed(0);
    editorStatusElement.textContent = `Zoom level: ${zoom}%`;
}
