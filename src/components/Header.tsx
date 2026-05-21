import { ArrowClockwise, Download, Moon, Sun } from "react-bootstrap-icons";
import { useStore } from "../common/store";
import { APP_THEMES } from "../common/types";
import { roundUp } from "../utils/parse";
import { clearState, saveAppThemeState } from "../utils/persistence";
import { createResolution } from "../utils/resolution";
import "./Header.css";

interface Props {
  onExportClick: () => void;
}

export default function Header({ onExportClick }: Props) {
  const appTheme = useStore((state) => state.appTheme);
  const setAppTheme = useStore((state) => state.setAppTheme);
  const width = useStore((state) => state.canvasConfig.width);
  const height = useStore((state) => state.canvasConfig.height);

  const toggleAppTheme = () => {
    const next =
      appTheme === APP_THEMES.DARK ? APP_THEMES.LIGHT : APP_THEMES.DARK;
    setAppTheme(next);
    saveAppThemeState();
  };

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
