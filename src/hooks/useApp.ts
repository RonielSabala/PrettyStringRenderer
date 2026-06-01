import { useEffect, useRef } from "react";
import { EVENTS } from "../common/constants/events";
import { useStore } from "../common/store";
import { type ExportDialogHandle } from "../hooks/export/useExportDialog";
import { clearState, saveActiveElementIdState } from "../utils/persistence";
import { useKeybinding } from "./useKeybinding";

// Element IDs that should NOT restore focus after reload
const FOCUS_EXCLUSIONS = new Set([
  "app-theme-btn",
  "workspace-reset-btn",
  "workspace-export-btn",
]);

export function useApp() {
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

  // Keybindings
  useKeybinding("app.fullReload", () => {
    clearState();
    location.reload();
  });

  return exportDialogRef;
}
