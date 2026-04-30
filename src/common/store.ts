import { create } from "zustand";
import { Tokenizer } from "../core/tokenizer";
import {
  APP_FONT_VARIANT_LIGATURES,
  CANVAS_DEFAULTS,
  DEFAULT_THEME,
  EDITOR_DEFAULTS,
  TYPOGRAPHY_DEFAULTS,
} from "./config";
import {
  CSS_FONT_VARIANT_LIGATURES,
  CSS_TEXT_RENDERING,
} from "./constants/css";
import type {
  CanvasConfig,
  CollapsedSections,
  EditorConfig,
  ThemeColors,
  TypographyConfig,
} from "./types";

interface AppState {
  // Data
  colors: ThemeColors;
  themes: ThemeColors[];
  activeThemeName: string;
  activeElementId: string;
  collapsedSectionIds: CollapsedSections;
  // Configs
  typographyConfig: TypographyConfig;
  editorConfig: EditorConfig;
  canvasConfig: CanvasConfig;
  // Engine (not persisted)
  tokenizer: Tokenizer;
  // Actions
  setColors: (colors: Partial<ThemeColors>) => void;
  setThemes: (themes: ThemeColors[]) => void;
  setActiveThemeName: (name: string) => void;
  setActiveElementId: (id: string) => void;
  setCollapsedSectionIds: (ids: CollapsedSections) => void;

  setTypographyConfig: (config: Partial<TypographyConfig>) => void;
  setEditorConfig: (config: Partial<EditorConfig>) => void;
  setCanvasConfig: (config: Partial<CanvasConfig>) => void;

  tokenize: (text: string) => void;
  recolor: () => void;
  redraw: () => void;

  adjustCanvas: () => void;
}

// Store

export const useStore = create<AppState>((set, get) => ({
  colors: { ...DEFAULT_THEME },
  themes: [],
  activeThemeName: "",
  activeElementId: "",
  collapsedSectionIds: {},

  typographyConfig: {
    fontSize: TYPOGRAPHY_DEFAULTS.fontSize.value,
    lineHeight: TYPOGRAPHY_DEFAULTS.lineHeight.value,
    letterSpacing: TYPOGRAPHY_DEFAULTS.letterSpacing.value,
    padX: TYPOGRAPHY_DEFAULTS.padX.value,
    padY: TYPOGRAPHY_DEFAULTS.padY.value,
    textRendering:
      APP_FONT_VARIANT_LIGATURES === CSS_FONT_VARIANT_LIGATURES.NONE
        ? CSS_TEXT_RENDERING.OPTIMIZE_SPEED
        : CSS_TEXT_RENDERING.OPTIMIZE_LEGIBILITY,
  },

  editorConfig: {
    cursorSelection: [],
    height: EDITOR_DEFAULTS.height,
    content: EDITOR_DEFAULTS.content,
    fontSize: EDITOR_DEFAULTS.fontSize.value,
  },

  canvasConfig: {
    zoom: CANVAS_DEFAULTS.zoom,
    panX: CANVAS_DEFAULTS.panX,
    panY: CANVAS_DEFAULTS.panY,
    width: CANVAS_DEFAULTS.width,
    height: CANVAS_DEFAULTS.height,
    fitToContent: CANVAS_DEFAULTS.fitToContent,
  },

  tokenizer: new Tokenizer(),

  // Actions

  setColors: (colors) =>
    set((state) => ({
      colors: {
        ...state.colors,
        ...Object.fromEntries(
          Object.entries(colors).filter(([, value]) => value !== undefined),
        ),
      } as ThemeColors,
    })),
  setThemes: (themes) => set({ themes }),
  setActiveThemeName: (name) => set({ activeThemeName: name }),
  setActiveElementId: (id) => set({ activeElementId: id }),
  setCollapsedSectionIds: (ids) => set({ collapsedSectionIds: ids }),

  setTypographyConfig: (config) =>
    set((state) => ({
      typographyConfig: { ...state.typographyConfig, ...config },
    })),

  setEditorConfig: (config) =>
    set((state) => ({ editorConfig: { ...state.editorConfig, ...config } })),

  setCanvasConfig: (config) =>
    set((state) => ({ canvasConfig: { ...state.canvasConfig, ...config } })),

  tokenize: (text) => {
    const { colors, tokenizer } = get();
    tokenizer.tokenize(text, colors);
  },

  recolor: () => {
    const { colors, tokenizer } = get();
    tokenizer.recolor(colors);
  },

  redraw: () => {},
  adjustCanvas: () => {},
}));

export const getStore = () => useStore.getState();
