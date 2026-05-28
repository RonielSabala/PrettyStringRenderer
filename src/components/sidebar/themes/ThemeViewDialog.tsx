import { THEME_BLOB_TYPE, THEMES_EXTENSION } from "../../../common/config";
import type { Theme } from "../../../common/types";
import { revokeAfter, urlFromObject } from "../../../utils/url";
import { Dialog, PrimaryButton, SecondaryButton } from "../../dialog";
import "./ThemeViewDialog.css";

interface Props {
  theme: Theme | null;
  onClose: () => void;
}

export default function ThemeViewDialog({ theme, onClose }: Props) {
  if (!theme) {
    return null;
  }

  const jsonString = JSON.stringify(theme, null, 2);

  // Handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };
  const handleDownload = () => {
    const url = urlFromObject(theme, THEME_BLOB_TYPE);
    const anchorElement = document.createElement("a");
    anchorElement.href = url;
    anchorElement.download = `${theme._name}${THEMES_EXTENSION}`;
    anchorElement.click();
    revokeAfter(url);
  };

  return (
    <Dialog
      isOpen={!!theme}
      title={`${theme._name}${THEMES_EXTENSION}`}
      onClose={onClose}
      actions={
        <>
          <SecondaryButton onClick={handleCopy}>Copy</SecondaryButton>
          <SecondaryButton onClick={handleDownload}>Download</SecondaryButton>
          <PrimaryButton onClick={onClose}>Close</PrimaryButton>
        </>
      }
    >
      <pre className="theme-view-content">{jsonString}</pre>
    </Dialog>
  );
}
