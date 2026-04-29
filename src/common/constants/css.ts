export const CSS = Object.freeze({
  // Section classes
  SECTION_HEADER: "section-header",
  SECTION_BODY: "section-body",
  COLLAPSED_HEADER: "header-collapsed",
  HIDDEN_BODY: "body-hidden",
  ROW: "row",
  BRACKET: "bracket",
  TYPOGRAPHY: "typography",
  // Inputs
  SWATCH: "swatch",
  SWATCH_FILL: "swatch-fill",
  COLOR_TYPE: "color",
  COLOR_PICKER: "color-picker",
  HEX_INPUT: "hex-input",
  NUMBER_TYPE: "number",
  NUMBER_INPUT: "number-input",
  // Theme classes
  THEME_ITEM: "theme-item",
  THEME_ITEM_ACTIVE: "active",
  THEME_NAME: "theme-name",
  THEME_SWATCH: "theme-swatch",
  // Resize handle classes
  DRAG: "drag",
} as const);

export const CSS_CURSORS = Object.freeze({
  DEFAULT: "" as string,
  GRAB: "grab",
  GRABBING: "grabbing",
} as const);

export const CSS_USER_SELECT = Object.freeze({
  AUTO: "" as string,
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

// Derived types
export type CssCursor = (typeof CSS_CURSORS)[keyof typeof CSS_CURSORS];
export type CssUserSelect =
  (typeof CSS_USER_SELECT)[keyof typeof CSS_USER_SELECT];
export type CssTextRendering =
  (typeof CSS_TEXT_RENDERING)[keyof typeof CSS_TEXT_RENDERING];
export type CssLigatures =
  (typeof CSS_FONT_VARIANT_LIGATURES)[keyof typeof CSS_FONT_VARIANT_LIGATURES];
