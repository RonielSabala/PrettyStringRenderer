import { THEME_BLOB_TYPE, THEMES_EXTENSION } from "../common/config";
import type { Theme } from "../common/types";
import { revokeAfter, urlFromObject } from "../utils/url";

export interface UseThemeViewDialogProps {
  theme: Theme | null;
}

export function useThemeViewDialog({ theme }: UseThemeViewDialogProps) {
  const jsonString = theme ? JSON.stringify(theme, null, 2) : "";

  // Handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };
  const handleDownload = () => {
    if (!theme) {
      return;
    }

    const url = urlFromObject(theme, THEME_BLOB_TYPE);
    const anchorElement = document.createElement("a");
    anchorElement.href = url;
    anchorElement.download = `${theme._name}${THEMES_EXTENSION}`;
    anchorElement.click();
    revokeAfter(url);
  };

  return { handleCopy, handleDownload, jsonString };
}
