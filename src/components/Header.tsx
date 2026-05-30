import { ArrowClockwise, Download, Moon, Sun } from "react-bootstrap-icons";
import { APP_THEMES } from "../common/types";
import { useHeader } from "../hooks/useHeader";
import { roundUp } from "../utils/parse";
import { createResolution } from "../utils/resolution";
import "./Header.css";

interface Props {
  onExportClick: () => void;
}

export default function Header({ onExportClick }: Props) {
  const { handleReset, toggleAppTheme, appTheme, width, height } = useHeader();

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
      <button
        id="app-theme-btn"
        className="static-action-btn"
        onClick={toggleAppTheme}
      >
        {appTheme === APP_THEMES.DARK ? (
          <Sun className="app-icon" />
        ) : (
          <Moon className="app-icon" />
        )}
      </button>
      <div className="header-title-separator" />
      <div className="header-badge">
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
