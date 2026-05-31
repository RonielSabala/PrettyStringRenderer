import { useEffect, useState } from "react";
import { THEMES_EXTENSION } from "../common/config";

export interface UseThemeExportDialogProps {
  isOpen: boolean;
  defaultFilename: string | null;
  onExport: (filename: string) => void;
}

export function useThemeExportDialog({
  isOpen,
  defaultFilename,
  onExport,
}: UseThemeExportDialogProps) {
  const [filename, setFilename] = useState(defaultFilename || "");

  useEffect(() => {
    if (isOpen && defaultFilename) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilename(defaultFilename + THEMES_EXTENSION);
    }
  }, [isOpen, defaultFilename]);

  const handleSubmit = () => {
    if (filename.trim()) {
      onExport(filename);
    }
  };

  return { filename, setFilename, handleSubmit };
}
