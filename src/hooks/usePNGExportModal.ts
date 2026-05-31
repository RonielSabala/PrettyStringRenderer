import { useCallback, useEffect, useState } from "react";
import {
    DEFAULT_EXPORT_IMAGE_FILENAME,
    DEFAULT_EXPORT_PNG_SCALAR,
    PNG_EXTENSION,
} from "../common/config";
import { createResolution, getScaledDimensions } from "../utils/resolution";

interface UsePNGExportModalProps {
  isOpen: boolean;
  canvasWidth: number;
  canvasHeight: number;
  defaultFilename: string;
  onExport: (scalar: number, filename: string) => void;
}

export function usePNGExportModal({
  isOpen,
  canvasWidth,
  canvasHeight,
  defaultFilename,
  onExport,
}: UsePNGExportModalProps) {
  const [scalar, setScalar] = useState(DEFAULT_EXPORT_PNG_SCALAR);
  const [filename, setFilename] = useState(defaultFilename);

  // Update filename when modal opens or dependencies change
  useEffect(() => {
    if (!isOpen || !defaultFilename) {
      return;
    }

    const [exportWidth, exportHeight] = getScaledDimensions(
      canvasWidth,
      canvasHeight,
      scalar,
    );
    const resolution = createResolution(exportWidth, exportHeight);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilename(
      `${DEFAULT_EXPORT_IMAGE_FILENAME}-${resolution}${PNG_EXTENSION}`,
    );
  }, [isOpen, defaultFilename, canvasWidth, canvasHeight, scalar]);

  const handleSubmit = useCallback(() => {
    if (filename.trim()) {
      onExport(scalar, filename);
    }
  }, [scalar, filename, onExport]);

  return {
    scalar,
    setScalar,
    filename,
    setFilename,
    handleSubmit,
  };
}
