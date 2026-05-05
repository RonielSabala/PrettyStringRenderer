import { useStore } from "../common/store";
import { roundUp } from "../utils/parse";
import { clearState } from "../utils/persistence";
import { createResolution } from "../utils/resolution";

interface Props {
  onExportClick: () => void;
}

export default function Header({ onExportClick }: Props) {
  const width = useStore((state) => state.canvasConfig.width);
  const height = useStore((state) => state.canvasConfig.height);

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
        {`${createResolution(width, height)} / ${roundUp(width / height)}:1`}
      </div>
      <button className="btn no-select" id="btn-export" onClick={onExportClick}>
        ↓ Export
      </button>
    </header>
  );
}
