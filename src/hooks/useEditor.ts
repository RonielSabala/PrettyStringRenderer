import { useCallback, useEffect, useRef, useState } from "react";
import { EDITOR_DEFAULTS } from "../common/config";
import { DOM_IDS } from "../common/constants/dom";
import { useStore } from "../common/store";
import { useKeybinding } from "../hooks/useKeybinding";
import { useWelcomeAnimation } from "../hooks/useWelcomeAnimation";
import { parseNumber, roundUp } from "../utils/parse";

interface Props {
  scheduleSave: () => void;
}

export function useEditor({ scheduleSave }: Props) {
  const editorConfig = useStore((state) => state.editorConfig);
  const setEditorConfig = useStore((state) => state.setEditorConfig);
  const tokenize = useStore((state) => state.tokenize);
  const redraw = useStore((state) => state.redraw);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasWrapRef = useRef<HTMLElement | null>(null);

  // Helpers

  const setHeightFraction = (height: number) =>
    setEditorConfig({
      heightFraction: roundUp(height / window.innerHeight, 3),
    });

  const getHeightFromFraction = (heightFraction: number) =>
    Math.ceil(heightFraction * window.innerHeight);

  // State

  const [height, setHeight] = useState(
    getHeightFromFraction(editorConfig.heightFraction),
  );

  const [fontSize, setFontSize] = useState(editorConfig.fontSize);

  // Initialize editor on mount
  useEffect(() => {
    canvasWrapRef.current = document.getElementById(DOM_IDS.CANVAS_WRAP);

    const editor = textareaRef.current;
    if (!editor) {
      return;
    }

    editor.value = editorConfig.content ?? EDITOR_DEFAULTS.content;
    editor.scrollTop = 0;

    const selection = editorConfig.cursorSelection;
    if (selection.length === 2) {
      editor.setSelectionRange(selection[0], selection[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start welcome animation
  const { cancelWelcomeAnimation } = useWelcomeAnimation();

  // Re-tokenize when content changes
  useEffect(() => {
    tokenize(editorConfig.content);
    redraw();
  }, [editorConfig.content, tokenize, redraw]);

  // Handlers

  const handleContent = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const content = event.target.value;
      cancelWelcomeAnimation();
      setEditorConfig({ content });
      scheduleSave();
    },
    [cancelWelcomeAnimation, setEditorConfig, scheduleSave],
  );

  const handleCursorChange = useCallback(() => {
    cancelWelcomeAnimation();

    const editor = textareaRef.current;
    if (!editor) {
      return;
    }

    const selection = [editor.selectionStart, editor.selectionEnd];
    setEditorConfig({ cursorSelection: selection });
    scheduleSave();
  }, [cancelWelcomeAnimation, setEditorConfig, scheduleSave]);

  const handleFontSize = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseNumber(
        event.target.value,
        EDITOR_DEFAULTS.fontSize.value,
      );

      setFontSize(value);
      setEditorConfig({ fontSize: value });
      scheduleSave();
    },
    [scheduleSave, setEditorConfig],
  );

  // Keybindings
  useKeybinding("canvas.focus", () => {
    cancelWelcomeAnimation();
    canvasWrapRef.current?.focus();
  });

  return {
    height,
    setHeight,
    setHeightFraction,
    getHeightFromFraction,
    fontSize,
    handleFontSize,
    textareaRef,
    handleContent,
    handleCursorChange,
    cancelWelcomeAnimation,
  };
}
