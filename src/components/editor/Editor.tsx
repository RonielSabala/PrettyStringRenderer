import { useMemo } from "react";
import { useEditor } from "../../hooks/editor/useEditor";
import { useResizeHandle } from "../../hooks/editor/useResizeHandle";
import {
  createSaveScheduler,
  saveEditorConfigState,
} from "../../utils/persistence";
import { toPx } from "../../utils/resolution";
import "./Editor.css";
import { EditorHeader } from "./EditorHeader";
import { EditorResizeHandle } from "./EditorResizeHandle";
import { EditorTextarea } from "./EditorTextarea";

export default function Editor() {
  const scheduleSave = useMemo(
    () => createSaveScheduler(saveEditorConfigState),
    [],
  );

  const {
    height,
    setHeight,
    setHeightFraction,
    getHeightFromFraction,
    fontSize,
    handleFontSize,
    textareaRef,
    handleContent,
    handleCursorChange,
    cancelWelcomeAnimation,
  } = useEditor({ scheduleSave });

  const { resizeHandleRef, onResizeStart, onResizeReset, panelRef } =
    useResizeHandle({
      height,
      setHeight,
      setHeightFraction,
      getHeightFromFraction,
      scheduleSave,
    });

  return (
    <>
      <EditorResizeHandle
        ref={resizeHandleRef}
        onMouseDown={onResizeStart}
        onDoubleClick={onResizeReset}
      />

      <div id="editor-panel" ref={panelRef} style={{ height: toPx(height) }}>
        <EditorHeader fontSize={fontSize} onFontSizeChange={handleFontSize} />
        <EditorTextarea
          ref={textareaRef}
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
