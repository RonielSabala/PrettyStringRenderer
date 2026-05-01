import { useEffect, useRef } from "react";
import { EVENTS } from "./common/constants/events";
import { useStore } from "./common/store";
import CanvasView from "./components/CanvasView";
import EditorPanel from "./components/EditorPanel";
import ExportDialog from "./components/ExportDialog";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { restoreState, saveActiveElementIdState } from "./utils/persistence";

// Element IDs that should NOT restore focus after reload
const FOCUS_EXCLUSIONS = new Set(["btn-reset", "btn-export"]);

// Restore persisted state before any child component reads it
restoreState();

export default function App() {
  const activeElementId = useStore((state) => state.activeElementId);
  const setActiveElementId = useStore((state) => state.setActiveElementId);
  const exportDialogRef = useRef<HTMLDialogElement>(null);

  // Restore focus after reload
  useEffect(() => {
    if (!activeElementId || FOCUS_EXCLUSIONS.has(activeElementId)) {
      return;
    }

    document.getElementById(activeElementId)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save active element on unload
  useEffect(() => {
    const handler = () => {
      const id = document.activeElement?.id ?? "";
      setActiveElementId(FOCUS_EXCLUSIONS.has(id) ? "" : id);
      saveActiveElementIdState();
    };

    window.addEventListener(EVENTS.WINDOW_RELOAD, handler);
    return () => window.removeEventListener(EVENTS.WINDOW_RELOAD, handler);
  }, [setActiveElementId]);

  // Font ready
  useEffect(() => {
    document.fonts.ready.then(() => {
      useStore.getState().redraw(true);
    });
  }, []);

  return (
    <div id="app">
      <Header onExportClick={() => exportDialogRef.current?.showModal()} />

      <aside id="app-sidebar">
        <Sidebar />
      </aside>

      <main id="app-work-area">
        <CanvasView />
        <EditorPanel />
      </main>

      <ExportDialog ref={exportDialogRef} />
    </div>
  );
}
