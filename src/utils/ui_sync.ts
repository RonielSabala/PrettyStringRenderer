import { getStore } from "../common/store";
import { describeCanvasAspectRatio } from "./resolution";

export function getResolutionBadgeText(): string {
  const { width, height } = getStore().canvasConfig;
  return describeCanvasAspectRatio(width, height);
}

export function getEditorZoomText(): string {
  const zoom = (getStore().canvasConfig.zoom * 100).toFixed(0);
  return `Zoom level: ${zoom}%`;
}
