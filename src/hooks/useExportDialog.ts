import { useCallback, useImperativeHandle, useState } from "react";
import { useStore } from "../common/store";
import { exportPNG, exportSVG } from "../utils/exporters";
import { useKeybinding } from "./useKeybinding";

export interface ExportDialogHandle {
  open: () => void;
  close: () => void;
}

interface Props {
  ref: React.Ref<ExportDialogHandle>;
}

export function useExportDialog({ ref }: Props) {
  const colors = useStore((state) => state.colors);
  const canvasConfig = useStore((state) => state.canvasConfig);
  const typographyConfig = useStore((state) => state.typographyConfig);

  const [isOpen, setIsOpen] = useState(false);
  const [isPNGModalOpen, setIsPNGModalOpen] = useState(false);
  const [isSVGModalOpen, setIsSVGModalOpen] = useState(false);

  // Expose open/close methods
  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [],
  );

  // Handlers

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handlePNGClick = useCallback(() => {
    closeDialog();
    setIsPNGModalOpen(true);
  }, [closeDialog]);

  const handleSVGClick = useCallback(() => {
    closeDialog();
    setIsSVGModalOpen(true);
  }, [closeDialog]);

  const handleClosePNGModal = useCallback(() => {
    setIsPNGModalOpen(false);
  }, []);

  const handleCloseSVGModal = useCallback(() => {
    setIsSVGModalOpen(false);
  }, []);

  const handlePNGExport = useCallback(
    (scalar: number, filename: string) => {
      setIsPNGModalOpen(false);
      exportPNG(canvasConfig, typographyConfig, colors, scalar, filename);
    },
    [canvasConfig, typographyConfig, colors],
  );

  const handleSVGExport = useCallback(
    (filename: string) => {
      setIsSVGModalOpen(false);
      exportSVG(canvasConfig, typographyConfig, colors, filename);
    },
    [canvasConfig, typographyConfig, colors],
  );

  // Keybindings
  useKeybinding("workspace.export", openDialog);

  return {
    isOpen,
    isPNGModalOpen,
    isSVGModalOpen,
    closeDialog,
    handlePNGClick,
    handleSVGClick,
    handlePNGExport,
    handleSVGExport,
    handleClosePNGModal,
    handleCloseSVGModal,
  };
}
