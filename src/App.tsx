import { useEffect, useRef } from "react";
import { EVENTS } from "./common/constants/events";
import { useStore } from "./common/store";
import CanvasView from "./components/CanvasView";
import EditorPanel from "./components/EditorPanel";
import ExportDialog from "./components/ExportDialog";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { restoreState } from "./utils/persistence";

export default function App() {
  const activeElementId = useStore((state) => state.activeElementId);
  const setActiveElementId = useStore((state) => state.setActiveElementId);
  const exportDialogRef = useRef<HTMLDialogElement>(null);

  // Restore persisted state once before first render cycle completes
  useEffect(() => {
    restoreState();
  }, []);

  // Restore focus to the last active element after reload
  useEffect(() => {
    if (!activeElementId) {
      return;
    }

    const element = document.getElementById(activeElementId);
    if (element) {
      element.focus();
    }
  }, [activeElementId]);

  // Save active element id before page unloads
  useEffect(() => {
    const handler = () => {
      const id = document.activeElement?.id ?? "";
      setActiveElementId(id === "btn-reset" ? "" : id);
    };

    window.addEventListener(EVENTS.WINDOW_RELOAD, handler);
    return () => window.removeEventListener(EVENTS.WINDOW_RELOAD, handler);
  }, [setActiveElementId]);

  return (
    <div id="app">
      <Header onExportClick={() => exportDialogRef.current?.showModal()} />

      <aside id="app-sidebar">
        <Sidebar />
      </aside>

      <main id="app-work-area">
        <CanvasView />
        <div id="editor-resize-handle" />
        <EditorPanel />
      </main>

      <ExportDialog ref={exportDialogRef} />
    </div>
  );
}
