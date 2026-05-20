import { useEffect, useRef } from "react";
import { createBuffer } from "../canvas/buffer";
import {
  APP_FONT_VARIANT_LIGATURES,
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
  clearState,
  createSaveScheduler,
  saveCanvasConfigState,
} from "../utils/persistence";
import { toPx } from "../utils/resolution";
import "./CanvasView.css";

const _scheduleSave = createSaveScheduler(saveCanvasConfigState);

export default function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const zoom = useStore((state) => state.canvasConfig.zoom);
  const setCanvasConfig = useStore((state) => state.setCanvasConfig);
  const backgroundColor = useStore((state) => state.colors.background);

  // Imperative state
  const spaceHeld = useRef(false);
  const panning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // CSS transform helpers

  const applyTransform = () => {
    if (!canvasRef.current || !innerRef.current) {
      return;
    }

    const { zoom, panX, panY } = zustand.getState().canvasConfig;
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

    canvasRef.current.style.fontVariantLigatures = APP_FONT_VARIANT_LIGATURES;
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

    return () => {
      buffer.destroy();
      zustand.setState({
        redraw: () => {},
        adjustCanvas: () => {},
        scheduleRedraw: () => {},
      });
    };
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

  // Canvas event handlers

  useEffect(() => {
    const wrap = wrapRef.current!;

    // Zoom handler
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const canvasConfig = zustand.getState().canvasConfig;

      if (event.altKey) {
        applyZoom(event);
      } else if (event.ctrlKey) {
        zustand.getState().setCanvasConfig({
          panX: canvasConfig.panX - event.deltaY * CANVAS_PAN_SCROLL_SPEED,
        });

        scheduleTransform();
      } else {
        zustand.getState().setCanvasConfig({
          panY: canvasConfig.panY - event.deltaY * CANVAS_PAN_SCROLL_SPEED,
        });

        scheduleTransform();
      }

      _scheduleSave();
    };

    // Panning-start handler
    const onMouseDown = (event: MouseEvent) => {
      if (!spaceHeld.current && event.button !== 2) {
        return;
      }

      event.preventDefault();
      const canvasConfig = zustand.getState().canvasConfig;

      panning.current = true;
      panStart.current = {
        x: event.clientX - canvasConfig.panX,
        y: event.clientY - canvasConfig.panY,
      };

      wrap.style.cursor = CSS_CURSORS.GRABBING;
    };

    wrap.addEventListener(EVENTS.CONTEXT_MENU, (event) =>
      event.preventDefault(),
    );
    wrap.addEventListener(EVENTS.WHEEL, onWheel, { passive: false });
    wrap.addEventListener(EVENTS.DBL_CLICK, resetZoom);
    wrap.addEventListener(EVENTS.MOUSE_DOWN, onMouseDown);

    // Panning handler
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

    // Panning-end handler
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

    const onKeyDown = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      const editor = document.getElementById("editor");
      if (
        matchesKeybinding(event, "canvas.panHold") &&
        document.activeElement !== editor
      ) {
        event.preventDefault();
        if (spaceHeld.current) {
          return;
        }

        spaceHeld.current = true;
        wrap.style.cursor = CSS_CURSORS.GRAB;
      }
      if (matchesKeybinding(event, "app.fullReload")) {
        event.preventDefault();
        clearState();
        location.reload();
      }
    };

    const onKeyUp = (event: Event) => {
      if (
        !(event instanceof KeyboardEvent) ||
        !matchesKeybinding(event, "canvas.panHold")
      ) {
        return;
      }

      spaceHeld.current = false;
      if (!panning.current) {
        wrap.style.cursor = CSS_CURSORS.DEFAULT;
      }
    };

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
      if (!innerRef.current) {
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
    syncCanvasInnerSize();
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
    </div>
  );
}
