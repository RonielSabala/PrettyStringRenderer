interface Props {
  onExportClick: () => void;
}

export default function Header({ onExportClick }: Props) {
  return (
    <header id="app-header">
      <span className="header-title">Pretty String Renderer</span>
      <button className="btn no-select" id="btn-reset" type="button">
        Reset
      </button>
      <div className="header-title-separator" />
      <div className="badge" id="header-badge" />
      <button className="btn no-select" id="btn-export" onClick={onExportClick}>
        ↓ Export
      </button>
    </header>
  );
}
