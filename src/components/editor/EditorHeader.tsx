import { EDITOR_DEFAULTS } from "../../common/config";
import { useStore } from "../../common/store";
import "./EditorHeader.css";

interface EditorHeaderProps {
  fontSize: number;
  onFontSizeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function FitToContentCheckbox({ id }: { id: string }) {
  const isChecked = useStore((state) => state.canvasConfig.fitToContent);
  const setCanvasConfig = useStore((state) => state.setCanvasConfig);
  const redraw = useStore((state) => state.redraw);

  return (
    <input
      type="checkbox"
      id={id}
      checked={isChecked}
      onChange={(event) => {
        setCanvasConfig({ fitToContent: event.target.checked });
        redraw({ forceAdjust: true });
      }}
    />
  );
}

function EditorStatus() {
  const zoom = useStore((state) => state.canvasConfig.zoom);
  return <>{`Zoom level: ${(zoom * 100).toFixed(0)}%`}</>;
}

export function EditorHeader({
  fontSize,
  onFontSizeChange,
}: EditorHeaderProps) {
  return (
    <div id="editor-header" className="no-user-select">
      <span id="editor-tab">Editor</span>

      <div className="editor-tab-container">
        <label id="editor-font-label" htmlFor="editor-font-size">
          Font size
        </label>
        <input
          id="editor-font-size"
          className="number-input"
          type="number"
          value={fontSize}
          min={EDITOR_DEFAULTS.fontSize.min}
          max={EDITOR_DEFAULTS.fontSize.max}
          onChange={onFontSizeChange}
        />
      </div>

      <div className="editor-tab-container">
        <FitToContentCheckbox id={"editor-fit-to-content"} />
        <label id="editor-fit-label" htmlFor="editor-fit-to-content">
          Fit to content
        </label>
      </div>

      <span id="editor-status">
        <EditorStatus />
      </span>
    </div>
  );
}
