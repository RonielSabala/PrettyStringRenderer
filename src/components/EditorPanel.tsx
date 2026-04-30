import { useCallback, useEffect, useRef, useState } from "react";
import {
  APP_FONT_VARIANT_LIGATURES,
  EDITOR_DEFAULTS,
  EDITOR_LETTER_SPACING,
  EDITOR_LINE_HEIGHT,
  EDITOR_MAX_HEIGHT_PERCENTAGE,
  getEditorMinHeight,
} from "../common/config";
import { CSS, CSS_USER_SELECT } from "../common/constants/css";
import { EVENTS } from "../common/constants/events";
import { matchesKeybinding } from "../common/keybindings";
import { useStore } from "../common/store";
import { parseNumber } from "../utils/parse";
import {
  createSaveScheduler,
  saveEditorConfigState,
} from "../utils/persistence";
import { toPx } from "../utils/resolution";

const _scheduleSave = createSaveScheduler(saveEditorConfigState);

// Sub-components

function FitToContentCheckbox() {
  const isChecked = useStore((state) => state.canvasConfig.fitToContent);
  const setCanvasConfig = useStore((state) => state.setCanvasConfig);
  const redraw = useStore((state) => state.redraw);
  const adjustCanvas = useStore((state) => state.adjustCanvas);

  return (
    <input
      type="checkbox"
      id="editor-fit-to-content"
      checked={isChecked}
      onChange={(event) => {
        setCanvasConfig({ fitToContent: event.target.checked });
        adjustCanvas();
        redraw();
      }}
    />
  );
}

function EditorStatus() {
  const zoom = useStore((state) => state.canvasConfig.zoom);
  return <>{`Zoom level: ${(zoom * 100).toFixed(0)}%`}</>;
}

// Main component

export default function EditorPanel() {
  const editorConfig = useStore((state) => state.editorConfig);
  const setEditorConfig = useStore((state) => state.setEditorConfig);
  const tokenize = useStore((state) => state.tokenize);
  const redraw = useStore((state) => state.redraw);
  const adjustCanvas = useStore((state) => state.adjustCanvas);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLElement | null>(null);

  const [height, setHeight] = useState(editorConfig.height);
  const [fontSize, setFontSize] = useState(editorConfig.fontSize);

  // Drag state
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const startMaxHeight = useRef(0);

  // Restore canvas wrap once on mount
  useEffect(() => {
    canvasWrapRef.current = document.getElementById("canvas-wrap");
  }, []);

  // Initialize editor on mount
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    // Only set cursor position and scroll on first load, not on every config change
    editor.scrollTop = 0;
    const selection = editorConfig.cursorSelection;
    if (selection.length === 2) {
      editor.setSelectionRange(selection[0], selection[1]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-tokenize when content changes
  useEffect(() => {
    tokenize(editorConfig.content);
    redraw();
  }, [editorConfig.content, tokenize, redraw]);

  // Handlers

  const _getEditorHeight = () => panelRef.current?.offsetHeight;

  const _getNormalizedHeight = (y: number) =>
    startHeight.current + (startY.current - y);

  const handleContent = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const content = event.target.value;
      tokenize(content);
      redraw();

      setEditorConfig({ content });
      _scheduleSave();
    },
    [tokenize, redraw, setEditorConfig],
  );

  const handleCursorChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const selection = [editor.selectionStart, editor.selectionEnd];
    setEditorConfig({ cursorSelection: selection });
    _scheduleSave();
  }, [setEditorConfig]);

  const handleFontSize = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseNumber(
        event.target.value,
        EDITOR_DEFAULTS.fontSize.value,
      );

      setFontSize(value);
      setEditorConfig({ fontSize: value });
      _scheduleSave();
    },
    [setEditorConfig],
  );

  const onResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      dragging.current = true;
      startY.current = event.clientY;
      startHeight.current = _getEditorHeight() ?? height;
      startMaxHeight.current = Math.round(
        window.innerHeight * EDITOR_MAX_HEIGHT_PERCENTAGE,
      );

      document.body.style.userSelect = CSS_USER_SELECT.NONE;
      handleRef.current?.classList.add(CSS.DRAG);
    },
    [height],
  );

  const onResizeReset = useCallback(() => {
    const defaultHeight = EDITOR_DEFAULTS.height;
    const currentHeight = _getEditorHeight() ?? height;
    const newHeight =
      currentHeight === defaultHeight ? getEditorMinHeight() : defaultHeight;

    setHeight(newHeight);
    setEditorConfig({ height: newHeight });
    adjustCanvas();
    _scheduleSave();
  }, [height, setEditorConfig, adjustCanvas]);

  // Canvas mouse keybinding

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!dragging.current) {
        return;
      }

      const minHeight = getEditorMinHeight();
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
      handleRef.current?.classList.remove(CSS.DRAG);

      setEditorConfig({ height: _getEditorHeight() ?? height });
      _scheduleSave();
    };

    document.addEventListener(EVENTS.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EVENTS.MOUSE_UP, onMouseUp);
    return () => {
      document.removeEventListener(EVENTS.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EVENTS.MOUSE_UP, onMouseUp);
    };
  }, [adjustCanvas, setEditorConfig, height]);

  // Canvas focus keybinding

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!matchesKeybinding(event, "canvas.focus")) {
        return;
      }

      event.preventDefault();
      canvasWrapRef.current?.focus();
    };

    document.addEventListener(EVENTS.KEY_DOWN, handler);
    return () => document.removeEventListener(EVENTS.KEY_DOWN, handler);
  }, []);

  return (
    <>
      <div
        id="editor-resize-handle"
        ref={handleRef}
        onMouseDown={onResizeStart}
        onDoubleClick={onResizeReset}
      />

      <div id="editor-panel" ref={panelRef} style={{ height: toPx(height) }}>
        <div id="editor-tabs">
          <div className="tab no-select">Editor</div>
          <div className="editor-font no-select">
            <span>Font size</span>
            <input
              className="number-input"
              type="number"
              id="editor-font-size"
              value={fontSize}
              min={EDITOR_DEFAULTS.fontSize.min}
              max={EDITOR_DEFAULTS.fontSize.max}
              onChange={handleFontSize}
            />
          </div>
          <label className="editor-fit-label no-select">
            <FitToContentCheckbox />
            Fit to content
          </label>
          <span id="editor-status" className="no-select">
            <EditorStatus />
          </span>
        </div>
        <textarea
          id="editor"
          ref={editorRef}
          spellCheck={false}
          defaultValue={editorConfig.content}
          style={{
            fontSize: toPx(fontSize),
            lineHeight: EDITOR_LINE_HEIGHT,
            letterSpacing: EDITOR_LETTER_SPACING,
            fontVariantLigatures: APP_FONT_VARIANT_LIGATURES,
            padding: `${toPx(EDITOR_DEFAULTS.padX)} ${toPx(EDITOR_DEFAULTS.padY)}`,
          }}
          onChange={handleContent}
          onClick={handleCursorChange}
          onKeyUp={handleCursorChange}
        />
      </div>
    </>
  );
}
