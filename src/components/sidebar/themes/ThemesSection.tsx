import { FolderX } from "react-bootstrap-icons";
import { useThemes } from "../../../hooks/useThemes";
import SidebarSection from "../SidebarSection";
import ThemeActions from "./ThemeActions";
import ThemeExportDialog from "./ThemeExportDialog";
import { ThemeItem } from "./ThemeItem";
import ThemeViewDialog from "./ThemeViewDialog";
import "./ThemesSection.css";

export default function ThemesSection() {
  const {
    themes,
    activeThemeName,
    activeItem,
    applyTheme,
    deleteTheme,
    showInModal,
    importThemes,
    exportTheme,
    isExporting,
    exportFilename,
    confirmExport,
    cancelExport,
    viewingTheme,
    closeViewingTheme,
  } = useThemes();

  const themesCount = themes.length;
  const noThemes = themesCount === 0;

  return (
    <SidebarSection title="Themes">
      <div className="theme-list no-user-select">
        {noThemes ? (
          <div id="theme-empty">
            <FolderX className="app-icon" />
            <p>No themes loaded</p>
            <span>Import or create a theme to get started.</span>
          </div>
        ) : (
          themes.map((theme, index) => (
            <ThemeItem
              key={theme._name}
              ref={theme._name === activeThemeName ? activeItem : null}
              theme={theme}
              isActive={theme._name === activeThemeName}
              onApply={applyTheme}
              onDelete={deleteTheme}
              onShow={showInModal}
              onNavigate={(upDirection) => {
                const nextIdx = upDirection
                  ? index - 1
                  : (index + 1) % themesCount;
                applyTheme(themes.at(nextIdx)!);
              }}
            />
          ))
        )}
      </div>

      <ThemeActions onImport={importThemes} onExport={exportTheme} />

      <ThemeExportDialog
        isOpen={isExporting}
        defaultFilename={exportFilename}
        onExport={confirmExport}
        onCancel={cancelExport}
      />

      <ThemeViewDialog theme={viewingTheme} onClose={closeViewingTheme} />
    </SidebarSection>
  );
}
