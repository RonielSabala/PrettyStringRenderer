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
import { getStore, useStore } from "../common/store";
import {
  createSaveScheduler,
  saveCanvasConfigState,
} from "../utils/persistence";
import { toPx } from "../utils/resolution";

const _scheduleSave = createSaveScheduler(saveCanvasConfigState);

export function useCanvas() {
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

    const config = getStore().canvasConfig;
    const zoom = config.zoom;
    let { panX, panY } = config;

    // Force centering
    if (zoom <= CANVAS_CENTERING_ZOOM_THRESHOLD && (panX !== 0 || panY !== 0)) {
      panX = 0;
      panY = 0;
      getStore().setCanvasConfig({ panX, panY });
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
        getStore().setCanvasConfig({ width, height });
        saveCanvasConfigState();
      },
    );

    // Wire imperative functions
    useStore.setState({
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
      useStore.setState({
        redraw: () => {},
        adjustCanvas: () => {},
        scheduleRedraw: () => {},
      });
    };
  }, []);

  // Pan helpers

  const handlePanX = useCallback((pan: number) => {
    getStore().setCanvasConfig({ panX: pan });
    scheduleTransform();
    _scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePanY = useCallback((pan: number) => {
    getStore().setCanvasConfig({ panY: pan });
    scheduleTransform();
    _scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zoom helpers

  const applyZoom = (event: WheelEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const pivotX = event.clientX - (rect.left + rect.width / 2);
    const pivotY = event.clientY - (rect.top + rect.height / 2);
    const { canvasConfig } = getStore();

    const oldZoom = canvasConfig.zoom;
    const zoomFactor =
      event.deltaY < 0 ? CANVAS_ZOOM_FACTOR : 1 / CANVAS_ZOOM_FACTOR;
    const newZoom = Math.max(
      CANVAS_MIN_ZOOM,
      Math.min(CANVAS_MAX_ZOOM, oldZoom * zoomFactor),
    );

    const appliedFactor = newZoom / oldZoom;
    getStore().setCanvasConfig({
      zoom: newZoom,
      panX: pivotX * (1 - appliedFactor) + canvasConfig.panX * appliedFactor,
      panY: pivotY * (1 - appliedFactor) + canvasConfig.panY * appliedFactor,
    });

    scheduleTransform();
    getStore().scheduleRedraw();
    _scheduleSave();
  };

  const resetZoom = () => {
    const config = getStore().canvasConfig;
    if (
      config.zoom === CANVAS_DEFAULTS.zoom &&
      config.panX === 0 &&
      config.panY === 0
    ) {
      return;
    }

    setCanvasConfig({ zoom: CANVAS_DEFAULTS.zoom, panX: 0, panY: 0 });
    scheduleTransform();
    getStore().scheduleRedraw();
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

      const canvasConfig = getStore().canvasConfig;
      if (canvasConfig.zoom <= CANVAS_CENTERING_ZOOM_THRESHOLD) {
        return;
      }

      const panDelta = event.deltaY * CANVAS_PAN_SCROLL_SPEED;
      if (matchesKeybinding(event, "canvas.panXModifier")) {
        getStore().setCanvasConfig({
          panX: canvasConfig.panX - panDelta,
        });
      } else {
        getStore().setCanvasConfig({
          panY: canvasConfig.panY - panDelta,
        });
      }

      scheduleTransform();
      _scheduleSave();
    };

    const onMouseDown = (event: MouseEvent) => {
      const canvasConfig = getStore().canvasConfig;
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

      getStore().setCanvasConfig({
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
        getStore().canvasConfig.zoom <= CANVAS_CENTERING_ZOOM_THRESHOLD
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

  return {
    wrapRef,
    innerRef,
    canvasRef,
    canvasRenderSize,
    viewportSize,
    zoom,
    panX,
    panY,
    handlePanX,
    handlePanY,
  };
}
