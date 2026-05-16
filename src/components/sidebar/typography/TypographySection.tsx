import { useCallback } from "react";
import { TYPOGRAPHY_DEFAULTS } from "../../../common/config";
import { useStore } from "../../../common/store";
import type { InputRange, TypographyConfig } from "../../../common/types";
import { camelToKebab, camelToTitle } from "../../../utils/parse";
import {
  createSaveScheduler,
  saveTypographyConfigState,
} from "../../../utils/persistence";
import SidebarSection from "../SidebarSection";
import NumberRow from "./NumberRow";

const _scheduleSave = createSaveScheduler(saveTypographyConfigState);

export default function TypographySection() {
  const config = useStore((state) => state.typographyConfig);
  const setConfig = useStore((state) => state.setTypographyConfig);
  const redraw = useStore((state) => state.redraw);
  const handleChange = useCallback(
    (key: keyof TypographyConfig, value: number) => {
      setConfig({ [key]: value } as Partial<TypographyConfig>);
      redraw();
      _scheduleSave();
    },
    [setConfig, redraw],
  );

  return (
    <SidebarSection title="Typography">
      {(
        Object.entries(TYPOGRAPHY_DEFAULTS) as [
          keyof TypographyConfig,
          InputRange,
        ][]
      ).map(([key, range]) => (
        <NumberRow
          key={key}
          id={`typography-${camelToKebab(key)}`}
          label={camelToTitle(key)}
          value={config[key] as number}
          min={range.min}
          max={range.max}
          step={range.step ?? 1}
          onChange={(value) => handleChange(key, value)}
        />
      ))}
    </SidebarSection>
  );
}
