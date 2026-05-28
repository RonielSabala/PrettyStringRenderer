import { create } from "zustand";
import type { RedrawOptions } from "../canvas/buffer";
import { Tokenizer } from "../core/tokenizer";
import {
  APP_DEFAULT_THEME,
  APP_FONT_VARIANT_LIGATURES,
  CANVAS_DEFAULTS,
  EDITOR_DEFAULTS,
  TYPOGRAPHY_DEFAULTS,
} from "./config";
import {
  CSS_FONT_VARIANT_LIGATURES,
  CSS_TEXT_RENDERING,
} from "./constants/css";
import {
  type AppThemeType,
  type CanvasConfig,
  type CollapsedSections,
  type EditorConfig,
  type ThemeColors,
  type TypographyConfig,
} from "./types";

interface AppState {
  // Data
  colors: ThemeColors;
  themes: ThemeColors[];
  appTheme: AppThemeType;
  activeThemeName: string;
  activeElementId: string;
  collapsedSections: CollapsedSections;

  // Configs
  typographyConfig: TypographyConfig;
  editorConfig: EditorConfig;
  canvasConfig: CanvasConfig;

  // Engine (not persisted)
  tokenizer: Tokenizer;

  // Actions

  setColors: (colors: Partial<ThemeColors>) => void;
  setThemes: (themes: ThemeColors[]) => void;
  setAppTheme: (appTheme: AppThemeType) => void;
  setActiveThemeName: (name: string) => void;
  setActiveElementId: (id: string) => void;
  setCollapsedSections: (sections: CollapsedSections) => void;

  setTypographyConfig: (config: Partial<TypographyConfig>) => void;
  setEditorConfig: (config: Partial<EditorConfig>) => void;
  setCanvasConfig: (config: Partial<CanvasConfig>) => void;

  tokenize: (text: string) => void;
  recolor: (changedKey?: string) => void;

  redraw: (options?: RedrawOptions) => void;
  adjustCanvas: () => void;
  scheduleRedraw: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  colors: {},
  themes: [],
  appTheme: APP_DEFAULT_THEME,
  activeThemeName: "",
  activeElementId: "",
  collapsedSections: {},

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
    heightFraction: EDITOR_DEFAULTS.heightFraction,
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

  setColors: (colors) => {
    set((state) => ({
      colors: {
        ...state.colors,
        ...Object.fromEntries(Object.entries(colors)),
      },
    }));
  },
  setThemes: (themes) => set({ themes }),
  setAppTheme: (appTheme) => {
    document.documentElement.dataset.theme = appTheme;
    set({ appTheme });
  },
  setActiveThemeName: (name) => set({ activeThemeName: name }),
  setActiveElementId: (id) => set({ activeElementId: id }),
  setCollapsedSections: (sections) => set({ collapsedSections: sections }),

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

  recolor: (changedKey?: string) => {
    const { colors, tokenizer } = get();
    tokenizer.recolor(colors, changedKey);
  },

  redraw: () => {},
  adjustCanvas: () => {},
  scheduleRedraw: () => {},
}));

export const getStore = () => useStore.getState();
