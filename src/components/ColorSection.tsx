import { useCallback } from "react";
import { DEFAULT_THEME } from "../common/config";
import { CSS } from "../common/constants/css";
import { useStore } from "../common/store";
import { setColor } from "../utils/color_sync";
import { toTitle } from "../utils/parse";
import { createSaveScheduler, saveColorsState } from "../utils/persistence";
import ColorRow from "./ColorRow";
import SidebarSection from "./SidebarSection";

const _scheduleSave = createSaveScheduler(saveColorsState);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { bracket, background, ...syntaxColors } = DEFAULT_THEME;

// Generic color section

interface ColorSectionProps {
  id: string;
  headerId: string;
  title: string;
  keys: string[];
  defaultCollapsed?: boolean;
}

export function ColorSection({
  id,
  headerId,
  title,
  keys,
  defaultCollapsed,
}: ColorSectionProps) {
  const colors = useStore((state) => state.colors);
  const handleChange = useCallback((key: string, value: string) => {
    setColor(key, value);
    _scheduleSave();
  }, []);

  return (
    <SidebarSection
      id={id}
      headerId={headerId}
      title={title}
      defaultCollapsed={defaultCollapsed}
    >
      {keys.map((key) => (
        <ColorRow
          key={key}
          id={key}
          label={toTitle(key)}
          color={colors[key] as string}
          onChange={(value) => handleChange(key, value)}
        />
      ))}
    </SidebarSection>
  );
}

// Pre-configured instances

export function BracketColorSection() {
  const brackets = useStore((state) => state.colors.bracket) as string[];
  const handleChange = useCallback(
    (i: number, value: string) => {
      const next = [...brackets];
      next[i] = value;
      setColor("bracket", next);
      _scheduleSave();
    },
    [brackets],
  );

  return (
    <SidebarSection
      id="section-bracket-colors"
      headerId="section-header-bracket-colors"
      title="Bracket Colors"
      defaultCollapsed
    >
      {brackets.map((color, i) => (
        <ColorRow
          key={i}
          id={`${CSS.BRACKET}${i}`}
          label={`Level ${i + 1}`}
          color={color}
          onChange={(value) => handleChange(i, value)}
        />
      ))}
    </SidebarSection>
  );
}

export function SyntaxColorSection() {
  return (
    <ColorSection
      id="section-syntax-colors"
      headerId="section-header-syntax-colors"
      title="Syntax Colors"
      keys={Object.keys(syntaxColors)}
      defaultCollapsed
    />
  );
}

export function CanvasColorSection() {
  return (
    <ColorSection
      id="section-canvas-colors"
      headerId="section-header-canvas-colors"
      title="Canvas Colors"
      keys={["background"]}
      defaultCollapsed
    />
  );
}
