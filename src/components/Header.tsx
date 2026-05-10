import { ArrowClockwise, Download } from "react-bootstrap-icons";
import { useStore } from "../common/store";
import { roundUp } from "../utils/parse";
import { clearState } from "../utils/persistence";
import { createResolution } from "../utils/resolution";
import "./Header.css";

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
    <>
      <span className="header-title">Pretty String Renderer</span>
      <button
        id="workspace-reset-btn"
        className="action-btn"
        onClick={handleReset}
      >
        <ArrowClockwise className="app-icon" />
        Reset
      </button>
      <div className="header-title-separator" />
      <div className="header-badge no-user-select">
        {`${createResolution(width, height)} / ${roundUp(width / height)}:1`}
      </div>
      <button
        id="workspace-export-btn"
        className="action-btn"
        onClick={onExportClick}
      >
        <Download className="app-icon" />
        <span>Export</span>
      </button>
    </>
  );
}
