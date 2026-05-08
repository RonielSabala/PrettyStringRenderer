import { Download } from "react-bootstrap-icons";
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
        id="btn-reset"
        className="btn no-user-select"
        onClick={handleReset}
      >
        Reset
      </button>
      <div className="header-title-separator" />
      <div className="badge no-user-select">
        {`${createResolution(width, height)} / ${roundUp(width / height)}:1`}
      </div>
      <button
        id="btn-export"
        className="btn btn-export no-user-select"
        onClick={onExportClick}
      >
        <Download size={16} />
        <span>Export</span>
      </button>
    </>
  );
}
