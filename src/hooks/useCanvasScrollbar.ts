import { useRef } from "react";
import { EVENTS } from "../common/constants/events";

const MIN_THUMB_SIZE_FRACTION = 0.04;

export const SCROLLBAR_ORIENTATION = Object.freeze({
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
} as const);

export type ScrollbarOrientation =
  (typeof SCROLLBAR_ORIENTATION)[keyof typeof SCROLLBAR_ORIENTATION];

export interface ScrollbarProps {
  orientation: ScrollbarOrientation;
  displaySize: number;
  viewportSize: number;
  zoom: number;
  pan: number;
  onPan: (pan: number) => void;
}

export function useCanvasScrollbar({
  orientation,
  displaySize,
  viewportSize,
  zoom,
  pan,
  onPan,
}: ScrollbarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartState = useRef({ clientPos: 0, panAtDragStart: 0 });
  const isHorizontal = orientation === SCROLLBAR_ORIENTATION.HORIZONTAL;

  const scaledContentSize = zoom * displaySize;
  const visiblePortionFraction = viewportSize / scaledContentSize;
  const thumbSizeFraction = Math.max(
    MIN_THUMB_SIZE_FRACTION,
    visiblePortionFraction,
  );

  const maxPanDistance = (scaledContentSize - viewportSize) / 2;
  const minPanDistance = -maxPanDistance;
  const totalPanRange = maxPanDistance - minPanDistance;
  const normalizedPan = (maxPanDistance - pan) / totalPanRange;
  const thumbPositionFraction = normalizedPan * (1 - thumbSizeFraction);

  const clampPanValue = (panValue: number) =>
    Math.max(minPanDistance, Math.min(maxPanDistance, panValue));

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || isDragging.current) {
      return;
    }

    const rect = trackRef.current.getBoundingClientRect();
    const clickPosition = isHorizontal
      ? (event.clientX - rect.left) / rect.width
      : (event.clientY - rect.top) / rect.height;

    const normalizedClickPos = Math.max(
      0,
      Math.min(1, clickPosition - thumbSizeFraction / 2),
    );
    const newPan =
      maxPanDistance -
      (normalizedClickPos / (1 - thumbSizeFraction)) * totalPanRange;

    onPan(clampPanValue(newPan));
  };

  const handleThumbMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    isDragging.current = true;
    dragStartState.current = {
      clientPos: isHorizontal ? event.clientX : event.clientY,
      panAtDragStart: pan,
    };

    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!trackRef.current) {
        return;
      }

      const rect = trackRef.current.getBoundingClientRect();
      const trackSize = isHorizontal ? rect.width : rect.height;
      const dragDelta =
        (isHorizontal ? mouseEvent.clientX : mouseEvent.clientY) -
        dragStartState.current.clientPos;
      const panDelta =
        -(dragDelta / (trackSize * (1 - thumbSizeFraction))) * totalPanRange;

      onPan(clampPanValue(dragStartState.current.panAtDragStart + panDelta));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener(EVENTS.MOUSE_MOVE, handleMouseMove);
      document.removeEventListener(EVENTS.MOUSE_UP, handleMouseUp);
    };

    document.addEventListener(EVENTS.MOUSE_MOVE, handleMouseMove);
    document.addEventListener(EVENTS.MOUSE_UP, handleMouseUp);
  };

  return {
    visiblePortionFraction,
    trackRef,
    handleTrackClick,
    isHorizontal,
    thumbSizeFraction,
    thumbPositionFraction,
    handleThumbMouseDown,
  };
}
