export default function EditorPanel() {
  return (
    <div id="editor-panel">
      <div id="editor-tabs">
        <div className="tab no-select">Editor</div>
        <div className="editor-font no-select">
          <span>Font size</span>
          <input className="number-input" type="number" id="editor-font-size" />
        </div>
        <label className="editor-fit-label no-select">
          <input type="checkbox" id="editor-fit-to-content" />
          Fit to content
        </label>
        <span id="editor-status" className="no-select" />
      </div>
      <textarea id="editor" spellCheck={false} />
    </div>
  );
}
