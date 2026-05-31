import { TYPOGRAPHY_DEFAULTS } from "../../../common/config";
import { useStore } from "../../../common/store";
import type { InputRange, TypographyConfig } from "../../../common/types";
import { useTypographySection } from "../../../hooks/useTypographySection";
import { camelToKebab, camelToTitle } from "../../../utils/parse";
import SidebarSection from "../SidebarSection";
import NumberRow from "./NumberRow";

export default function TypographySection() {
  const config = useStore((state) => state.typographyConfig);
  const handleChange = useTypographySection();

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
