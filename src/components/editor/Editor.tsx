import { useEditor } from "../../hooks/useEditor";
import { toPx } from "../../utils/resolution";
import "./Editor.css";
import { EditorHeader } from "./EditorHeader";
import { EditorResizeHandle } from "./EditorResizeHandle";
import { EditorTextarea } from "./EditorTextarea";

export default function Editor() {
  const {
    resizeHandleRef,
    onResizeStart,
    onResizeReset,
    panelRef,
    height,
    fontSize,
    handleFontSize,
    textareaRef,
    handleContent,
    handleCursorChange,
    cancelWelcomeAnimation,
  } = useEditor();

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
