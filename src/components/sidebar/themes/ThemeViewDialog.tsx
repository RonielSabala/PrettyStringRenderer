import { THEMES_EXTENSION } from "../../../common/config";
import {
  useThemeViewDialog,
  type UseThemeViewDialogProps,
} from "../../../hooks/useThemeViewDialog";
import { Dialog, PrimaryButton, SecondaryButton } from "../../dialog";
import "./ThemeViewDialog.css";

interface Props extends UseThemeViewDialogProps {
  onClose: () => void;
}

export default function ThemeViewDialog({ theme, onClose }: Props) {
  const { handleCopy, handleDownload, jsonString } = useThemeViewDialog({
    theme,
  });

  if (!theme) {
    return null;
  }

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
