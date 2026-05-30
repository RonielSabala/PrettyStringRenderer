import { useCallback } from "react";
import { DEFAULT_THEME } from "../../../common/config";
import { getStore, useStore } from "../../../common/store";
import { TOKENS, type ThemeColor, type TokenType } from "../../../common/types";
import { toTitle } from "../../../utils/parse";
import {
  createSaveScheduler,
  saveColorsState,
} from "../../../utils/persistence";
import SidebarSection from "../SidebarSection";
import ColorRow from "./ColorRow";

const _scheduleSave = createSaveScheduler(saveColorsState);

// Private helpers

function _setColor(
  themeKey: TokenType,
  themeValue: ThemeColor | ThemeColor[],
): void {
  getStore().setColors({ [themeKey]: themeValue });
  getStore().recolor(themeKey);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { bracket, background, ...syntaxColors } = DEFAULT_THEME;

// Generic color section

interface Props {
  title: string;
  keys: TokenType[];
  defaultCollapsed?: boolean;
  doRedraw?: boolean;
}

export function ColorSection({
  title,
  keys,
  defaultCollapsed,
  doRedraw = true,
}: Props) {
  const colors = useStore((state) => state.colors);
  const redraw = useStore((state) => state.redraw);
  const handleChange = useCallback(
    (key: TokenType, value: ThemeColor) => {
      _setColor(key, value);
      if (doRedraw) {
        redraw();
      }

      _scheduleSave();
    },
    [doRedraw, redraw],
  );

  return (
    <SidebarSection title={title} defaultCollapsed={defaultCollapsed}>
      {keys.map((key) => (
        <ColorRow
          key={key}
          id={key}
          label={toTitle(key)}
          color={colors[key] as ThemeColor}
          onChange={(value) => handleChange(key, value)}
        />
      ))}
    </SidebarSection>
  );
}

// Pre-configured instances

export function BracketColorSection() {
  const redraw = useStore((state) => state.redraw);
  const brackets = useStore((state) => state.colors.bracket);
  const handleChange = useCallback(
    (i: number, value: ThemeColor) => {
      if (!brackets) {
        if (!value) {
          return;
        }

        _setColor(TOKENS.BRACKET, [value]);
      } else {
        const next = [...brackets] as ThemeColor[];
        next[i] = value;
        _setColor(TOKENS.BRACKET, next);
      }

      redraw();
      _scheduleSave();
    },
    [redraw, brackets],
  );

  return (
    <SidebarSection title="Bracket Colors" defaultCollapsed>
      {!brackets || brackets.length === 0 ? (
        <p>No bracket colors to show.</p>
      ) : (
        brackets.map((color, i) => (
          <ColorRow
            key={i}
            id={`bracket-${i}`}
            label={`Level ${i + 1}`}
            color={color}
            onChange={(value) => handleChange(i, value)}
          />
        ))
      )}
    </SidebarSection>
  );
}

export function SyntaxColorSection() {
  return (
    <ColorSection
      title="Syntax Colors"
      keys={Object.keys(syntaxColors) as TokenType[]}
      defaultCollapsed
    />
  );
}

export function CanvasColorSection() {
  return (
    <ColorSection
      title="Canvas Colors"
      keys={[TOKENS.BACKGROUND]}
      defaultCollapsed
      doRedraw={false}
    />
  );
}
