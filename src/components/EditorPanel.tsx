import { useCallback, useEffect, useRef, useState } from "react";
import { EDITOR_DEFAULTS, MAX_EDITOR_HEIGHT_FRACTION } from "../common/config";
import { CSS_CURSORS, CSS_USER_SELECT } from "../common/constants/css";
import { EVENTS } from "../common/constants/events";
import { useStore } from "../common/store";
import { useKeybinding } from "../hooks/useKeybinding";
import { useWelcomeAnimation } from "../hooks/useWelcomeAnimation";
import { parseNumber, roundUp } from "../utils/parse";
import {
  createSaveScheduler,
  saveEditorConfigState,
} from "../utils/persistence";
import { toPx } from "../utils/resolution";
import "./EditorPanel.css";
import { EditorHeader } from "./editor/EditorHeader";
import { EditorResizeHandle } from "./editor/EditorResizeHandle";
import { EditorTextarea } from "./editor/EditorTextarea";

const _scheduleSave = createSaveScheduler(saveEditorConfigState);

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

  const getFractionFromHeight = (height: number) =>
    roundUp(height / window.innerHeight, 3);

  const getHeightFromFraction = (heightFraction: number) =>
    Math.ceil(heightFraction * window.innerHeight);

  const [height, setHeight] = useState(
    getHeightFromFraction(editorConfig.heightFraction),
  );
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

    editor.value = editorConfig.content ?? EDITOR_DEFAULTS.content;
    editor.scrollTop = 0;

    const selection = editorConfig.cursorSelection;
    if (selection.length === 2) {
      editor.setSelectionRange(selection[0], selection[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start welcome animation
  const { cancelWelcomeAnimation } = useWelcomeAnimation();

  // Re-tokenize when content changes
  useEffect(() => {
    tokenize(editorConfig.content);
    redraw();
  }, [editorConfig.content, tokenize, redraw]);

  // Helpers

  const getEditorMinHeight = useCallback(() => {
    const element = document.getElementById("editor-header");
    return element?.offsetHeight ?? height;
  }, [height]);

  const _getEditorHeight = () => panelRef.current?.offsetHeight;

  const _getNormalizedHeight = (y: number) =>
    startHeight.current + (startY.current - y);

  // Handlers

  const handleContent = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const content = event.target.value;
      cancelWelcomeAnimation();
      setEditorConfig({ content });
      _scheduleSave();
    },
    [setEditorConfig, cancelWelcomeAnimation],
  );

  const handleCursorChange = useCallback(() => {
    cancelWelcomeAnimation();

    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const selection = [editor.selectionStart, editor.selectionEnd];
    setEditorConfig({ cursorSelection: selection });
    _scheduleSave();
  }, [setEditorConfig, cancelWelcomeAnimation]);

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
      startMaxHeight.current = getHeightFromFraction(
        MAX_EDITOR_HEIGHT_FRACTION,
      );

      document.body.style.userSelect = CSS_USER_SELECT.NONE;
      handleRef.current?.classList.add(CSS_CURSORS.DRAG);
    },
    [height],
  );

  const onResizeReset = useCallback(() => {
    const defaultHeight = getHeightFromFraction(EDITOR_DEFAULTS.heightFraction);
    const currentHeight = _getEditorHeight() ?? height;
    const newHeight =
      currentHeight === defaultHeight ? getEditorMinHeight() : defaultHeight;

    setHeight(newHeight);
    setEditorConfig({ heightFraction: getFractionFromHeight(newHeight) });
    _scheduleSave();

    setTimeout(() => adjustCanvas(), 0);
  }, [height, getEditorMinHeight, setEditorConfig, adjustCanvas]);

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
      handleRef.current?.classList.remove(CSS_CURSORS.DRAG);

      setEditorConfig({
        heightFraction: getFractionFromHeight(_getEditorHeight() ?? height),
      });
      _scheduleSave();
    };

    document.addEventListener(EVENTS.MOUSE_MOVE, onMouseMove);
    document.addEventListener(EVENTS.MOUSE_UP, onMouseUp);
    return () => {
      document.removeEventListener(EVENTS.MOUSE_MOVE, onMouseMove);
      document.removeEventListener(EVENTS.MOUSE_UP, onMouseUp);
    };
  }, [adjustCanvas, setEditorConfig, height, getEditorMinHeight]);

  // Keybindings
  useKeybinding("canvas.focus", () => {
    cancelWelcomeAnimation();
    canvasWrapRef.current?.focus();
  });

  return (
    <>
      <EditorResizeHandle
        ref={handleRef}
        onMouseDown={onResizeStart}
        onDoubleClick={onResizeReset}
      />

      <div id="editor-panel" ref={panelRef} style={{ height: toPx(height) }}>
        <EditorHeader fontSize={fontSize} onFontSizeChange={handleFontSize} />
        <EditorTextarea
          ref={editorRef}
          fontSize={fontSize}
          onChange={handleContent}
          onClick={handleCursorChange}
          onKeyUp={handleCursorChange}
          onFocus={cancelWelcomeAnimation}
        />
      </div>
    </>
  );
}
