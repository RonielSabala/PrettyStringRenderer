import { THEMES_EXTENSION } from "../../../common/config";
import {
  useThemeExportDialog,
  type UseThemeExportDialogProps,
} from "../../../hooks/sidebar/themes/useThemeExportDialog";
import {
  Dialog,
  FilenameInput,
  PrimaryButton,
  SecondaryButton,
} from "../../dialog";

interface Props extends UseThemeExportDialogProps {
  onCancel: () => void;
}

export default function ThemeExportDialog({
  isOpen,
  defaultFilename,
  onExport,
  onCancel,
}: Props) {
  const { filename, setFilename, handleSubmit } = useThemeExportDialog({
    isOpen,
    defaultFilename,
    onExport,
  });

  return (
    <Dialog
      isOpen={isOpen}
      title="Export Theme"
      onClose={onCancel}
      actions={
        <>
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={!filename.trim()}>
            Export Theme
          </PrimaryButton>
        </>
      }
    >
      <FilenameInput
        value={filename}
        placeholder={defaultFilename + THEMES_EXTENSION}
        onChange={setFilename}
        onSubmit={handleSubmit}
        autoFocus
      />
    </Dialog>
  );
}
