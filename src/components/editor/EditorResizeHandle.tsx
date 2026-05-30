import { forwardRef } from "react";
import "./EditorResizeHandle.css";

interface Props {
  onMouseDown: (event: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

export const EditorResizeHandle = forwardRef<HTMLDivElement, Props>(
  ({ onMouseDown, onDoubleClick }, ref) => (
    <div
      id="editor-resize-handle"
      ref={ref}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    />
  ),
);
