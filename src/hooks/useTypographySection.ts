import { useStore } from "../common/store";
import type { TypographyConfig } from "../common/types";
import {
  createSaveScheduler,
  saveTypographyConfigState,
} from "../utils/persistence";

const _scheduleSave = createSaveScheduler(saveTypographyConfigState);

export function useTypographySection() {
  const setConfig = useStore((state) => state.setTypographyConfig);
  const redraw = useStore((state) => state.redraw);

  const handleChange = (key: keyof TypographyConfig, value: number) => {
    setConfig({ [key]: value } as Partial<TypographyConfig>);
    redraw();
    _scheduleSave();
  };

  return handleChange;
}
