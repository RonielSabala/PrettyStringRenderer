import "./App.css";
import { APP_DEFAULT_THEME } from "./common/config";
import Canvas from "./components/canvas/Canvas";
import Editor from "./components/editor/Editor";
import { ExportDialog } from "./components/export/ExportDialog";
import Header from "./components/Header";
import Sidebar from "./components/sidebar/Sidebar";
import { useApp } from "./hooks/useApp";
import { restoreState } from "./utils/persistence";

// Set theme
document.documentElement.dataset.theme = APP_DEFAULT_THEME;

// Restore persisted state
restoreState();

export default function App() {
  const exportDialogRef = useApp();

  return (
    <div id="app">
      <header id="app-header">
        <Header onExportClick={() => exportDialogRef.current?.open()} />
      </header>

      <aside id="app-sidebar" className="scroll-container">
        <Sidebar />
      </aside>

      <main id="app-workspace">
        <Canvas />
        <Editor />
      </main>

      <ExportDialog ref={exportDialogRef} />
    </div>
  );
}
