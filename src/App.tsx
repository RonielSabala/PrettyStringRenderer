import { useEffect, useRef } from "react";
import "./App.css";
import { APP_DEFAULT_THEME } from "./common/config";
import { EVENTS } from "./common/constants/events";
import { useStore } from "./common/store";
import CanvasView from "./components/CanvasView";
import EditorPanel from "./components/EditorPanel";
import {
  ExportDialog,
  type ExportDialogHandle,
} from "./components/export/ExportDialog";
import Header from "./components/Header";
import Sidebar from "./components/sidebar/Sidebar";
import { restoreState, saveActiveElementIdState } from "./utils/persistence";

// Element IDs that should NOT restore focus after reload
const FOCUS_EXCLUSIONS = new Set([
  "app-theme-btn",
  "workspace-reset-btn",
  "workspace-export-btn",
]);

document.documentElement.dataset.theme = APP_DEFAULT_THEME;

// Restore persisted state before any child component reads it
restoreState();

export default function App() {
  const activeElementId = useStore((state) => state.activeElementId);
  const setActiveElementId = useStore((state) => state.setActiveElementId);
  const exportDialogRef = useRef<ExportDialogHandle>(null);

  // Restore focus after reload
  useEffect(() => {
    if (!activeElementId || FOCUS_EXCLUSIONS.has(activeElementId)) {
      return;
    }

    document.getElementById(activeElementId)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save active element id on unload
  useEffect(() => {
    const handler = () => {
      const id = document.activeElement?.id ?? "";
      setActiveElementId(FOCUS_EXCLUSIONS.has(id) ? "" : id);
      saveActiveElementIdState();
    };

    window.addEventListener(EVENTS.WINDOW_RELOAD, handler);
    return () => window.removeEventListener(EVENTS.WINDOW_RELOAD, handler);
  }, [setActiveElementId]);

  return (
    <div id="app">
      <header id="app-header">
        <Header onExportClick={() => exportDialogRef.current?.open()} />
      </header>

      <aside id="app-sidebar" className="scroll-container">
        <Sidebar />
      </aside>

      <main id="app-workspace">
        <CanvasView />
        <EditorPanel />
      </main>

      <ExportDialog ref={exportDialogRef} />
    </div>
  );
}
