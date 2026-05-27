import _defaults from "../../userData/profile.example.json";
import { isObjectEmpty } from "../utils/parse";
import type { AppThemeType, ThemeColors } from "./types";

const _userFile = import.meta.glob("../../userData/profile.json", {
  eager: true,
}) as Record<string, { default: typeof _defaults }>;

const _userDefaults =
  _userFile["../../userData/profile.json"]?.default ??
  ({} as Partial<typeof _defaults>);

export const HAS_CUSTOM_PROFILE = !isObjectEmpty(_userDefaults);

// App

export const LINE_BREAK = "\n";
export const LINE_BREAK_LENGTH = LINE_BREAK.length;
export const SAVE_TIMEOUT_MS = 200;
export const MAX_HEX_INPUT_LENGTH = 7;

export const APP_DEFAULT_THEME = (_userDefaults.app?.defaultTheme ??
  _defaults.app.defaultTheme) as AppThemeType;

export const APP_FONT_VARIANT_LIGATURES =
  _userDefaults.app?.fontVariantLigatures ?? _defaults.app.fontVariantLigatures;

// Welcome Animation

export const WELCOME_CURSOR_CHAR = "▏";
export const WELCOME_BLINK_INTERVAL_MS = 550;
export const WELCOME_START_DELAY_MS = 500;
export const WELCOME_BLINKING_DURATION_MS = 4 * WELCOME_BLINK_INTERVAL_MS;
export const WELCOME_TYPING_JITTER_MAX_MS = 12;
export const WELCOME_DELETE_LINE_MS = 100;
export const WELCOME_DELETION_JITTER_MAX_MS = 30;
export const WELCOME_NEXT_ANIMATION_DELAY_MS = 15000;

// Typography

const _typographyDefaults = _userDefaults.typography ?? {};
export const TYPOGRAPHY_DEFAULTS = {
  fontSize: {
    value: _typographyDefaults.fontSize ?? _defaults.typography.fontSize,
    min: 5,
    max: 300,
  },
  lineHeight: {
    value: _typographyDefaults.lineHeight ?? _defaults.typography.lineHeight,
    min: 0.8,
    max: 4,
    step: 0.01,
  },
  letterSpacing: {
    value:
      _typographyDefaults.letterSpacing ?? _defaults.typography.letterSpacing,
    min: -10,
    max: 50,
    step: 0.5,
  },
  padX: {
    value: _typographyDefaults.padX ?? _defaults.typography.padX,
    min: 0,
    max: 400,
  },
  padY: {
    value: _typographyDefaults.padY ?? _defaults.typography.padY,
    min: 0,
    max: 400,
  },
};

// Editor

export const EDITOR_LINE_HEIGHT = "auto";
export const EDITOR_LETTER_SPACING = "auto";
export const MAX_EDITOR_HEIGHT_FRACTION = 0.8;

const _editorDefaults = _userDefaults.editor ?? {};
export const EDITOR_DEFAULTS = {
  content: _editorDefaults.content ?? _defaults.editor.content,
  heightFraction:
    _editorDefaults.heightFraction ?? _defaults.editor.heightFraction,
  padX: _editorDefaults.padX ?? _defaults.editor.padX,
  padY: _editorDefaults.padY ?? _defaults.editor.padY,
  fontSize: {
    value: _editorDefaults.fontSize ?? _defaults.editor.fontSize,
    min: 8,
    max: 36,
  },
};

// Canvas

export const CANVAS_MIN_ZOOM = 0.01;
export const CANVAS_MAX_ZOOM = 10;
export const CANVAS_ZOOM_FACTOR = 1.15;
export const CANVAS_PAN_SCROLL_SPEED = 0.5;
export const CANVAS_VIEWPORT_PADDING_PX = 25;
export const CANVAS_REDRAW_TIMEOUT_MS = 120;
export const CANVAS_CENTERING_ZOOM_THRESHOLD = 1.0;
export const MAX_CANVAS_BUFFER_PIXELS = 64_000_000;

const _canvasDefaults = _userDefaults.canvas ?? {};
const _canvasWidth = _canvasDefaults.width ?? _defaults.canvas.width;
const _canvasHeight = _canvasDefaults.height ?? _defaults.canvas.height;
export const CANVAS_DEFAULTS = {
  zoom: 1,
  panX: 0,
  panY: 0,
  width: _canvasWidth,
  height: _canvasHeight,
  aspectRatio: _canvasWidth / _canvasHeight,
  fitToContent: _canvasDefaults.fitToContent ?? _defaults.canvas.fitToContent,
  font: _canvasDefaults.font ?? _defaults.canvas.font,
  fontWeight: _canvasDefaults.fontWeight ?? _defaults.canvas.fontWeight,
};

// Export

export const PNG_EXTENSION = ".png";
export const SVG_EXTENSION = ".svg";
export const SVG_NS = "http://www.w3.org/2000/svg";
export const PNG_BLOB_TYPE = { type: "image/png" } as const;
export const SVG_BLOB_TYPE = { type: "image/svg+xml" } as const;
export const MIN_EXPORT_PNG_SCALAR = 0.5;
export const MAX_EXPORT_PNG_SCALAR = 5;
export const EXPORT_PNG_SCALAR_STEP = 0.5;
export const DEFAULT_EXPORT_PNG_SCALAR = 1;
export const EXPORT_PNG_PROMPT_SCALAR_EXAMPLES = [0.5, 1, 2];

const _exportDefaults = _userDefaults.export ?? {};
export const DEFAULT_EXPORT_THEME_FILENAME =
  _exportDefaults.defaultThemeFilename ?? _defaults.export.defaultThemeFilename;
export const DEFAULT_EXPORT_IMAGE_FILENAME =
  _exportDefaults.defaultImageFilename ?? _defaults.export.defaultImageFilename;

// Themes

export const THEMES_EXTENSION = ".json";
export const THEMES_FILE_TYPE = "file";
export const THEME_BLOB_TYPE = { type: "application/json" } as const;
export const DEFAULT_THEME = Object.freeze(
  (_userDefaults.theme ?? _defaults.theme) as ThemeColors,
);
