import { useCallback, useEffect, useRef, useState } from "react";
import { createBuffer } from "../canvas/buffer";
import {
  APP_FONT_VARIANT_LIGATURES,
  CANVAS_CENTERING_ZOOM_THRESHOLD,
  CANVAS_DEFAULTS,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  CANVAS_PAN_SCROLL_SPEED,
  CANVAS_ZOOM_FACTOR,
} from "../common/config";
import { CSS_CURSORS } from "../common/constants/css";
import { EVENTS } from "../common/constants/events";
import { matchesKeybinding } from "../common/keybindings";
import { useStore, useStore as zustand } from "../common/store";
import {
  createSaveScheduler,
  saveCanvasConfigState,
} from "../utils/persistence";
import { toPx } from "../utils/resolution";
import "./CanvasView.css";

const _scheduleSave = createSaveScheduler(saveCanvasConfigState);

const MIN_THUMB_SIZE_FRACTION = 0.04;
const SCROLLBAR_ORIENTATION = Object.freeze({
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
} as const);

type ScrollbarOrientation =
  (typeof SCROLLBAR_ORIENTATION)[keyof typeof SCROLLBAR_ORIENTATION];

interface ScrollbarProps {
  orientation: ScrollbarOrientation;
  zoom: number;
  displaySize: number;
  viewportSize: number;
  pan: number;
  onPan: (pan: number) => void;
}

function CanvasScrollbar({
  orientation,
  zoom,
  displaySize,
  viewportSize,
  pan,
  onPan,
}: ScrollbarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartState = useRef({ clientPos: 0, panAtDragStart: 0 });
  const isHorizontal = orientation === SCROLLBAR_ORIENTATION.HORIZONTAL;

  // Calculate dimensions
  const scaledContentSize = zoom * displaySize;
  const visiblePortionFraction = viewportSize / scaledContentSize;

  // No scrollbar needed
  if (visiblePortionFraction >= 1) {
    return null;
  }

  // Calculate scrollbar proportions
  const thumbSizeFraction = Math.max(
    MIN_THUMB_SIZE_FRACTION,
    visiblePortionFraction,
  );
  const maxPanDistance = (scaledContentSize - viewportSize) / 2;
  const minPanDistance = -maxPanDistance;
  const totalPanRange = maxPanDistance - minPanDistance;

  // Calculate thumb position and size
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

  return (
    <div
      className={`canvas-scrollbar canvas-scrollbar-${orientation}`}
      ref={trackRef}
      onClick={handleTrackClick}
    >
      <div
        className="canvas-scrollbar-thumb"
        style={
          isHorizontal
            ? {
                width: `${thumbSizeFraction * 100}%`,
                left: `${thumbPositionFraction * 100}%`,
              }
            : {
                height: `${thumbSizeFraction * 100}%`,
                top: `${thumbPositionFraction * 100}%`,
              }
        }
        onMouseDown={handleThumbMouseDown}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export default function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const zoom = useStore((state) => state.canvasConfig.zoom);
  const panX = useStore((state) => state.canvasConfig.panX);
  const panY = useStore((state) => state.canvasConfig.panY);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [canvasRenderSize, setCanvasRenderSize] = useState({
    width: 0,
    height: 0,
  });
  const backgroundColor = useStore((state) => state.colors.background);
  const setCanvasConfig = useStore((state) => state.setCanvasConfig);

  // Imperative state
  const spaceHeld = useRef(false);
  const panning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // Transform helpers

  const applyTransform = () => {
    if (!canvasRef.current || !innerRef.current) {
      return;
    }

    const config = zustand.getState().canvasConfig;
    const zoom = config.zoom;
    let { panX, panY } = config;

    // Force centering
    if (zoom <= CANVAS_CENTERING_ZOOM_THRESHOLD && (panX !== 0 || panY !== 0)) {
      panX = 0;
      panY = 0;
      zustand.getState().setCanvasConfig({ panX, panY });
    }

    const transform = `translate(${toPx(panX)},${toPx(panY)}) scale(${zoom})`;
    canvasRef.current.style.transform = transform;
    innerRef.current.style.transform = transform;
  };

  const scheduleTransform = () => {
    if (rafId.current !== null) {
      return;
    }

    rafId.current = requestAnimationFrame(() => {
      applyTransform();
      rafId.current = null;
    });
  };

  // Buffer mount
  useEffect(() => {
    if (!canvasRef.current || !wrapRef.current) {
      return;
    }

    const canvasStyle = canvasRef.current.style;
    canvasStyle.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;
    canvasStyle.boxShadow = "0 var(--space-2) var(--space-12) var(--black-a70)";

    const buffer = createBuffer(
      canvasRef.current,
      wrapRef.current,
      (width, height) => {
        zustand.getState().setCanvasConfig({ width, height });
        saveCanvasConfigState();
      },
    );

    // Wire imperative functions into the store
    zustand.setState({
      redraw: buffer.redraw,
      adjustCanvas: buffer.adjustCanvas,
      scheduleRedraw: buffer.scheduleRedraw,
    });

    // Initial draw
    applyTransform();
    buffer.adjustCanvas();

    const resizeObserver = new ResizeObserver(() => {
      if (!wrapRef.current || !canvasRef.current) {
        return;
      }

      setViewportSize({
        width: wrapRef.current.clientWidth,
        height: wrapRef.current.clientHeight,
      });
      setCanvasRenderSize({
        width: canvasRef.current.offsetWidth,
        height: canvasRef.current.offsetHeight,
      });
    });

    resizeObserver.observe(wrapRef.current);
    resizeObserver.observe(canvasRef.current);

    return () => {
      buffer.destroy();
      resizeObserver.disconnect();
      zustand.setState({
        redraw: () => {},
        adjustCanvas: () => {},
        scheduleRedraw: () => {},
      });
    };
  }, []);

  // Pan helpers

  const handlePanX = useCallback((pan: number) => {
    zustand.getState().setCanvasConfig({ panX: pan });
    scheduleTransform();
    _scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePanY = useCallback((pan: number) => {
    zustand.getState().setCanvasConfig({ panY: pan });
    scheduleTransform();
    _scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zoom helpers

  const applyZoom = (event: WheelEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const pivotX = event.clientX - (rect.left + rect.width / 2);
    const pivotY = event.clientY - (rect.top + rect.height / 2);
    const { canvasConfig } = zustand.getState();

    const oldZoom = canvasConfig.zoom;
    const zoomFactor =
      event.deltaY < 0 ? CANVAS_ZOOM_FACTOR : 1 / CANVAS_ZOOM_FACTOR;
    const newZoom = Math.max(
      CANVAS_MIN_ZOOM,
      Math.min(CANVAS_MAX_ZOOM, oldZoom * zoomFactor),
    );

    const appliedFactor = newZoom / oldZoom;
    zustand.getState().setCanvasConfig({
      zoom: newZoom,
      panX: pivotX * (1 - appliedFactor) + canvasConfig.panX * appliedFactor,
      panY: pivotY * (1 - appliedFactor) + canvasConfig.panY * appliedFactor,
    });

    scheduleTransform();
    zustand.getState().scheduleRedraw();
    _scheduleSave();
  };

  const resetZoom = () => {
    const config = zustand.getState().canvasConfig;
    if (
      config.zoom === CANVAS_DEFAULTS.zoom &&
      config.panX === 0 &&
      config.panY === 0
    ) {
      return;
    }

    setCanvasConfig({ zoom: CANVAS_DEFAULTS.zoom, panX: 0, panY: 0 });
    scheduleTransform();
    zustand.getState().scheduleRedraw();
    _scheduleSave();
  };

  // Keybindings
  useEffect(() => {
    const wrap = wrapRef.current!;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (matchesKeybinding(event, "canvas.zoomModifier")) {
        applyZoom(event);
        _scheduleSave();
        return;
      }

      const canvasConfig = zustand.getState().canvasConfig;
      if (canvasConfig.zoom <= CANVAS_CENTERING_ZOOM_THRESHOLD) {
        return;
      }

      const panDelta = event.deltaY * CANVAS_PAN_SCROLL_SPEED;
      if (matchesKeybinding(event, "canvas.panXModifier")) {
        zustand.getState().setCanvasConfig({
          panX: canvasConfig.panX - panDelta,
        });
      } else {
        zustand.getState().setCanvasConfig({
          panY: canvasConfig.panY - panDelta,
        });
      }

      scheduleTransform();
      _scheduleSave();
    };

    const onMouseDown = (event: MouseEvent) => {
      const canvasConfig = zustand.getState().canvasConfig;
      if (
        canvasConfig.zoom <= CANVAS_CENTERING_ZOOM_THRESHOLD ||
        (!spaceHeld.current && event.button !== 2)
      ) {
        return;
      }

      event.preventDefault();
      panning.current = true;
      panStart.current = {
        x: event.clientX - canvasConfig.panX,
        y: event.clientY - canvasConfig.panY,
      };

      wrap.style.cursor = CSS_CURSORS.GRABBING;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!panning.current) {
        return;
      }

      zustand.getState().setCanvasConfig({
        panX: event.clientX - panStart.current.x,
        panY: event.clientY - panStart.current.y,
      });

      scheduleTransform();
    };

    const onMouseUp = () => {
      if (!panning.current) {
        return;
      }

      panning.current = false;
      wrap.style.cursor = spaceHeld.current
        ? CSS_CURSORS.GRAB
        : CSS_CURSORS.DEFAULT;

      _scheduleSave();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        spaceHeld.current ||
        document.activeElement === document.getElementById("editor") ||
        !matchesKeybinding(event, "canvas.panHold") ||
        zustand.getState().canvasConfig.zoom <= CANVAS_CENTERING_ZOOM_THRESHOLD
      ) {
        return;
      }

      event.preventDefault();
      spaceHeld.current = true;
      wrap.style.cursor = CSS_CURSORS.GRAB;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!spaceHeld.current || !matchesKeybinding(event, "canvas.panHold")) {
        return;
      }

      spaceHeld.current = false;
      if (!panning.current) {
        wrap.style.cursor = CSS_CURSORS.DEFAULT;
      }
    };

    wrap.addEventListener(EVENTS.CONTEXT_MENU, (event) =>
      event.preventDefault(),
    );
    wrap.addEventListener(EVENTS.WHEEL, onWheel, { passive: false });
    wrap.addEventListener(EVENTS.DBL_CLICK, resetZoom);
    wrap.addEventListener(EVENTS.MOUSE_DOWN, onMouseDown);

    document.addEventListener(EVENTS.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EVENTS.MOUSE_UP, onMouseUp);
    document.addEventListener(EVENTS.KEY_DOWN, onKeyDown);
    document.addEventListener(EVENTS.KEY_UP, onKeyUp);

    return () => {
      wrap.removeEventListener(EVENTS.CONTEXT_MENU, (event) =>
        event.preventDefault(),
      );
      wrap.removeEventListener(EVENTS.WHEEL, onWheel);
      wrap.removeEventListener(EVENTS.DBL_CLICK, resetZoom);
      wrap.removeEventListener(EVENTS.MOUSE_DOWN, onMouseDown);
      document.removeEventListener(EVENTS.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EVENTS.MOUSE_UP, onMouseUp);
      document.removeEventListener(EVENTS.KEY_DOWN, onKeyDown);
      document.removeEventListener(EVENTS.KEY_UP, onKeyUp);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep background pattern size constant regardless of zoom
  useEffect(() => {
    if (!innerRef.current || !canvasRef.current) {
      return;
    }

    const syncCanvasInnerSize = () => {
      if (!innerRef.current || !canvasRef.current) {
        return;
      }

      const innerRefStyle = innerRef.current.style;
      innerRefStyle.opacity = `${Number(!backgroundColor)}`;
      innerRefStyle.width = toPx(canvasRef.current.offsetWidth);
      innerRefStyle.height = toPx(canvasRef.current.offsetHeight);
    };

    const updateBackgroundPattern = () => {
      if (backgroundColor || !innerRef.current) {
        return;
      }

      const inverseZoom = 1 / zoom;
      const scaledSize = `calc(var(--space-6) * ${inverseZoom})`;
      const scaledOffset = `calc(var(--space-3) * ${inverseZoom})`;
      const minusScaledOffset = `calc(${scaledOffset} * -1)`;

      const innerRefStyle = innerRef.current.style;
      innerRefStyle.backgroundSize = `${scaledSize} ${scaledSize}`;
      innerRefStyle.backgroundPosition = `0 0, 0 ${scaledOffset}, ${scaledOffset} ${minusScaledOffset}, ${minusScaledOffset} 0`;
    };

    // Initial sync
    updateBackgroundPattern();

    // Watch for canvas size changes
    const resizeObserver = new ResizeObserver(() => {
      syncCanvasInnerSize();
    });

    resizeObserver.observe(canvasRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [zoom, backgroundColor]);

  return (
    <div id="canvas-wrap" ref={wrapRef} tabIndex={-1}>
      <div id="canvas-inner" ref={innerRef} />
      <canvas id="canvas" ref={canvasRef} />
      <CanvasScrollbar
        orientation={SCROLLBAR_ORIENTATION.HORIZONTAL}
        zoom={zoom}
        displaySize={canvasRenderSize.width}
        viewportSize={viewportSize.width}
        pan={panX}
        onPan={handlePanX}
      />
      <CanvasScrollbar
        orientation={SCROLLBAR_ORIENTATION.VERTICAL}
        zoom={zoom}
        displaySize={canvasRenderSize.height}
        viewportSize={viewportSize.height}
        pan={panY}
        onPan={handlePanY}
      />
    </div>
  );
}
