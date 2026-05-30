import { useCallback, useEffect, useRef } from "react";
import { EDITOR_DEFAULTS, MAX_EDITOR_HEIGHT_FRACTION } from "../common/config";
import { CSS_CURSORS, CSS_USER_SELECT } from "../common/constants/css";
import { DOM_IDS } from "../common/constants/dom";
import { EVENTS } from "../common/constants/events";
import { useStore } from "../common/store";

interface Props {
  height: number;
  setHeight: (height: number) => void;
  setHeightFraction: (height: number) => void;
  getHeightFromFraction: (heightFraction: number) => number;
  scheduleSave: () => void;
}

export function useResizeHandle({
  height,
  setHeight,
  setHeightFraction,
  getHeightFromFraction,
  scheduleSave,
}: Props) {
  const adjustCanvas = useStore((state) => state.adjustCanvas);

  const panelRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const startMaxHeight = useRef(0);

  // Private helpers

  const _getEditorHeight = useCallback(
    () => panelRef.current?.offsetHeight,
    [panelRef],
  );

  const _getNormalizedHeight = (height: number) =>
    startHeight.current + (startY.current - height);

  const _getEditorMinHeight = useCallback(() => {
    const header = document.getElementById(DOM_IDS.EDITOR_HEADER);
    return header?.offsetHeight ?? height;
  }, [height]);

  // Handlers

  const onResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      dragging.current = true;
      startY.current = event.clientY;
      startHeight.current = _getEditorHeight() ?? height;
      startMaxHeight.current = getHeightFromFraction(
        MAX_EDITOR_HEIGHT_FRACTION,
      );

      document.body.style.userSelect = CSS_USER_SELECT.NONE;
      resizeHandleRef.current?.classList.add(CSS_CURSORS.DRAG);
    },
    [_getEditorHeight, getHeightFromFraction, height],
  );

  const onResizeReset = useCallback(() => {
    const defaultHeight = getHeightFromFraction(EDITOR_DEFAULTS.heightFraction);
    const currentHeight = _getEditorHeight() ?? height;
    const newHeight =
      currentHeight === defaultHeight ? _getEditorMinHeight() : defaultHeight;

    setHeight(newHeight);
    setHeightFraction(newHeight);
    scheduleSave();

    setTimeout(() => adjustCanvas(), 0);
  }, [
    getHeightFromFraction,
    _getEditorHeight,
    height,
    _getEditorMinHeight,
    setHeight,
    setHeightFraction,
    scheduleSave,
    adjustCanvas,
  ]);

  // Keybindings
  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!dragging.current) {
        return;
      }

      const minHeight = _getEditorMinHeight();
      const maxHeight = startMaxHeight.current;

      const currentHeight = _getEditorHeight() ?? 0;
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, _getNormalizedHeight(event.clientY)),
      );

      if (
        (newHeight === maxHeight && currentHeight === maxHeight) ||
        (newHeight === minHeight && currentHeight === minHeight)
      )
        return;

      setHeight(newHeight);
      adjustCanvas();
    };

    const onMouseUp = () => {
      if (!dragging.current) {
        return;
      }

      dragging.current = false;
      document.body.style.userSelect = CSS_USER_SELECT.AUTO;
      resizeHandleRef.current?.classList.remove(CSS_CURSORS.DRAG);

      const finalHeight = _getEditorHeight() ?? height;
      setHeightFraction(finalHeight);
      scheduleSave();
    };

    document.addEventListener(EVENTS.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EVENTS.MOUSE_UP, onMouseUp);
    return () => {
      document.removeEventListener(EVENTS.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EVENTS.MOUSE_UP, onMouseUp);
    };
  }, [
    adjustCanvas,
    setHeightFraction,
    height,
    _getEditorMinHeight,
    _getEditorHeight,
    setHeight,
    scheduleSave,
  ]);

  return {
    resizeHandleRef,
    onResizeStart,
    onResizeReset,
    panelRef,
  };
}
