import { DEFAULT_THEME } from "../../../common/config";
import { useStore } from "../../../common/store";
import { TOKENS, type ThemeColor, type TokenType } from "../../../common/types";
import {
  useBracketColorSection,
  useColorSection,
  type UseColorSectionProps,
} from "../../../hooks/useColorSection";
import { toTitle } from "../../../utils/parse";
import SidebarSection from "../SidebarSection";
import ColorRow from "./ColorRow";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { bracket, background, ...syntaxColors } = DEFAULT_THEME;

// Generic color section

interface Props extends UseColorSectionProps {
  title: string;
  keys: TokenType[];
  defaultCollapsed?: boolean;
}

export function ColorSection({
  title,
  keys,
  defaultCollapsed,
  doRedraw = true,
}: Props) {
  const colors = useStore((state) => state.colors);
  const { handleChange } = useColorSection({ doRedraw });

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
  const { brackets, handleChange } = useBracketColorSection();

  return (
    <SidebarSection title="Bracket Colors" defaultCollapsed>
      {!brackets || brackets.length === 0 ? (
        <p>No bracket colors to show.</p>
      ) : (
        brackets.map((color, idx) => (
          <ColorRow
            key={idx}
            id={`bracket-${idx}`}
            label={`Level ${idx + 1}`}
            color={color}
            onChange={(value) => handleChange(idx, value)}
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
