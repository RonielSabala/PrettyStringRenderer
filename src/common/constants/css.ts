export const CSS_CURSORS = Object.freeze({
  DEFAULT: "",
  DRAG: "drag",
  GRAB: "grab",
  GRABBING: "grabbing",
} as const);

export const CSS_USER_SELECT = Object.freeze({
  AUTO: "",
  NONE: "none",
} as const);

export const CSS_FONT_VARIANT_LIGATURES = Object.freeze({
  NONE: "none",
} as const);

export const CSS_TEXT_RENDERING = Object.freeze({
  OPTIMIZE_SPEED: "optimizeSpeed",
  OPTIMIZE_LEGIBILITY: "optimizeLegibility",
  GEOMETRIC_PRECISION: "geometricPrecision",
} as const);

export type CssTextRendering =
  (typeof CSS_TEXT_RENDERING)[keyof typeof CSS_TEXT_RENDERING];
