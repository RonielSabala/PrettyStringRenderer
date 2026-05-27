import { getFormattedKeybinding } from "../common/keybindings";
import { centerString, centerStringArray } from "../utils/parse";
import { WELCOME_DATA } from "./data";

const _LINE_START = "# ";
const _LINE_START_PAD = " ".repeat(_LINE_START.length);
const _TIP_SEPARATOR = "- ";
const _HEADER_DIVIDER_CHAR = "=";

const getRandom = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const ANIMATION_DELAYS_MS = Object.freeze({
  INSTANTANEOUS: 0,
  FAST: 10,
  SLOW: 25,
} as const);

export type AnimationDelayType =
  (typeof ANIMATION_DELAYS_MS)[keyof typeof ANIMATION_DELAYS_MS];

export interface WelcomeLine {
  text: string;
  charDelayMs: AnimationDelayType;
}

export function generateWelcomeLines(): WelcomeLine[] {
  const rawHeading = getRandom(WELCOME_DATA.headings);
  const rawSubtitle = getRandom(WELCOME_DATA.subtitles);
  const rawFormula = getRandom(WELCOME_DATA.formulas);

  // Format tips
  const genericTip = getRandom(WELCOME_DATA.genericTips).replace(
    /\{\{([^}]+)\}\}/g,
    (_, bindingId) => {
      return getFormattedKeybinding(bindingId);
    },
  );
  const specificTip = getRandom(WELCOME_DATA.specificTips).replace(
    "{var}",
    rawFormula.variable,
  );

  // Get header divider
  const longestHeaderLine = Math.max(rawHeading.length, rawSubtitle.length);
  const headerDivider =
    _LINE_START + _HEADER_DIVIDER_CHAR.repeat(longestHeaderLine);

  // Center lines
  const heading = centerString(rawHeading, longestHeaderLine);
  const subtitle = centerString(rawSubtitle, longestHeaderLine);

  // Map formula lines
  const formulaLines: WelcomeLine[] = centerStringArray(
    rawFormula.artLines,
    longestHeaderLine,
  ).map((line) => ({
    text: _LINE_START_PAD + line,
    charDelayMs: ANIMATION_DELAYS_MS.SLOW,
  }));

  return [
    // Header Block
    {
      text: headerDivider,
      charDelayMs: ANIMATION_DELAYS_MS.SLOW,
    },
    {
      text: _LINE_START + heading,
      charDelayMs: ANIMATION_DELAYS_MS.SLOW,
    },
    {
      text: _LINE_START + subtitle,
      charDelayMs: ANIMATION_DELAYS_MS.FAST,
    },
    {
      text: headerDivider,
      charDelayMs: ANIMATION_DELAYS_MS.INSTANTANEOUS,
    },
    {
      text: "",
      charDelayMs: ANIMATION_DELAYS_MS.INSTANTANEOUS,
    },
    // Formula Block
    ...formulaLines,
    {
      text: "",
      charDelayMs: ANIMATION_DELAYS_MS.INSTANTANEOUS,
    },
    // Tips Block
    {
      text: `${_LINE_START}Tips:`,
      charDelayMs: ANIMATION_DELAYS_MS.INSTANTANEOUS,
    },
    {
      text: _LINE_START + _TIP_SEPARATOR + genericTip,
      charDelayMs: ANIMATION_DELAYS_MS.FAST,
    },
    {
      text: _LINE_START + _TIP_SEPARATOR + specificTip,
      charDelayMs: ANIMATION_DELAYS_MS.SLOW,
    },
  ];
}
