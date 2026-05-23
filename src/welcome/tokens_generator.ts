import { LINE_BREAK } from "../common/config";
import { centerString, centerStringArray } from "../utils/parse";
import { WELCOME_DATA } from "./data";

const LINE_START = "# ";
const HEADER_DIVIDER_CHAR = "=";

const getRandom = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const ANIMATION_DELAYS_MS = Object.freeze({
  INSTANTANEOUS: 0,
  SUPER_FAST: 5,
  FAST: 10,
  SLOW: 25,
} as const);

export type AnimationDelayType =
  (typeof ANIMATION_DELAYS_MS)[keyof typeof ANIMATION_DELAYS_MS];

export interface WelcomeToken {
  text: string;
  delayMs: AnimationDelayType;
}

export function generateWelcomeTokens(): WelcomeToken[] {
  const rawHeading = getRandom(WELCOME_DATA.headings);
  const rawSubtitle = getRandom(WELCOME_DATA.subtitles);
  const rawFormula = getRandom(WELCOME_DATA.formulas);
  const genericTip = getRandom(WELCOME_DATA.genericTips);
  const specificTip = getRandom(WELCOME_DATA.specificTips).replace(
    "{var}",
    rawFormula.variable,
  );

  const longestHeaderLine = Math.max(rawHeading.length, rawSubtitle.length);
  const headerDivider =
    LINE_START + HEADER_DIVIDER_CHAR.repeat(longestHeaderLine);

  // Center values
  const heading = centerString(rawHeading, longestHeaderLine);
  const subtitle = centerString(rawSubtitle, longestHeaderLine);
  const formula = centerStringArray(rawFormula.artLines, longestHeaderLine)
    .map((line) => " ".repeat(LINE_START.length) + line)
    .join(LINE_BREAK);

  return [
    // Header Block
    {
      text: headerDivider + LINE_BREAK,
      delayMs: ANIMATION_DELAYS_MS.SUPER_FAST,
    },
    {
      text: `${LINE_START}${heading}${LINE_BREAK}`,
      delayMs: ANIMATION_DELAYS_MS.SLOW,
    },
    {
      text: `${LINE_START}${subtitle}${LINE_BREAK}`,
      delayMs: ANIMATION_DELAYS_MS.FAST,
    },
    {
      text: headerDivider + LINE_BREAK + LINE_BREAK,
      delayMs: ANIMATION_DELAYS_MS.INSTANTANEOUS,
    },
    // Formula Block
    {
      text: `${formula}${LINE_BREAK}${LINE_BREAK}`,
      delayMs: ANIMATION_DELAYS_MS.SLOW,
    },
    // Tips Block
    {
      text: `${LINE_START}Tips:${LINE_BREAK}${LINE_START}${LINE_BREAK}`,
      delayMs: ANIMATION_DELAYS_MS.INSTANTANEOUS,
    },
    {
      text: `${LINE_START}- ${genericTip}${LINE_BREAK}`,
      delayMs: ANIMATION_DELAYS_MS.FAST,
    },
    {
      text: `${LINE_START}- ${specificTip}`,
      delayMs: ANIMATION_DELAYS_MS.SLOW,
    },
  ];
}
