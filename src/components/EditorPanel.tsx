export default function EditorPanel() {
  return (
    <div id="editor-panel">
      <div id="editor-tabs">
        <div className="tab no-select">Editor</div>
        <span id="editor-status" className="no-select" />
      </div>
      <textarea id="editor" spellCheck={false} />
    </div>
  );
}
