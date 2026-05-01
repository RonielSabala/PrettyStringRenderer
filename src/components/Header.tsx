import { clearState } from "../utils/persistence";
import { getResolutionBadgeText } from "../utils/ui_sync";

interface Props {
  onExportClick: () => void;
}

export default function Header({ onExportClick }: Props) {
  const handleReset = () => {
    clearState();
    location.reload();
  };

  return (
    <header id="app-header">
      <span className="header-title">Pretty String Renderer</span>
      <button
        className="btn no-select"
        id="btn-reset"
        type="button"
        onClick={handleReset}
      >
        Reset
      </button>
      <div className="header-title-separator" />
      <div className="badge" id="header-badge">
        {getResolutionBadgeText()}
      </div>
      <button className="btn no-select" id="btn-export" onClick={onExportClick}>
        ↓ Export
      </button>
    </header>
  );
}
