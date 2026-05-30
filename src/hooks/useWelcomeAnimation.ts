import { useCallback, useEffect, useRef } from "react";
import {
  HAS_CUSTOM_PROFILE,
  LINE_BREAK,
  LINE_BREAK_LENGTH,
  SAVE_TIMEOUT_MS,
  WELCOME_BLINK_INTERVAL_MS,
  WELCOME_BLINKING_DURATION_MS,
  WELCOME_CURSOR_CHAR,
  WELCOME_DELETE_LINE_MS,
  WELCOME_DELETION_JITTER_MAX_MS,
  WELCOME_NEXT_ANIMATION_DELAY_MS,
  WELCOME_START_DELAY_MS,
  WELCOME_TYPING_JITTER_MAX_MS,
} from "../common/config";
import { DOM_IDS } from "../common/constants/dom";
import { getStore, useStore } from "../common/store";
import {
  ANIMATION_DELAYS_MS,
  generateWelcomeLines,
} from "../welcome/tokens_generator";

export function useWelcomeAnimation() {
  const setEditorConfig = useStore((state) => state.setEditorConfig);

  const hasRunRef = useRef(false);
  const isCancelledRef = useRef(false);

  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rawContentRef = useRef("");

  // Helpers

  const _getTextarea = () =>
    document.getElementById(
      DOM_IDS.EDITOR_TEXTAREA,
    ) as HTMLTextAreaElement | null;

  const _setTextarea = useCallback(
    (textarea: HTMLTextAreaElement | null, showCursor: boolean = false) => {
      const displayContent =
        rawContentRef.current + (showCursor ? WELCOME_CURSOR_CHAR : " ");
      if (textarea) {
        textarea.value = displayContent;
      }

      setEditorConfig({ content: displayContent });
    },
    [setEditorConfig],
  );

  const _shouldPause = (callback: () => void): boolean => {
    const isHidden = document.hidden;
    if (isHidden) {
      activeTimerRef.current = setTimeout(callback, SAVE_TIMEOUT_MS);
    }

    return isCancelledRef.current || isHidden;
  };

  // Handlers

  const cancelWelcomeAnimation = useCallback(() => {
    if (isCancelledRef.current) {
      return;
    }

    isCancelledRef.current = true;

    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
    }
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }

    // Clear cursor
    const textarea = _getTextarea();
    if (textarea && textarea.value.endsWith(WELCOME_CURSOR_CHAR)) {
      _setTextarea(textarea);
    }
  }, [_setTextarea]);

  useEffect(() => {
    if (
      HAS_CUSTOM_PROFILE ||
      hasRunRef.current ||
      getStore().editorConfig.content
    ) {
      return;
    }

    hasRunRef.current = true;

    const startTypingPhase = () => {
      if (isCancelledRef.current) {
        return;
      }

      const textarea = _getTextarea();
      const lines = generateWelcomeLines();
      const maxLineIdx = lines.length - 1;

      const newFirstLine = lines[0].text;
      const oldFirstLine = rawContentRef.current.replace(LINE_BREAK, "");
      const shortestLine =
        newFirstLine.length < oldFirstLine.length ? newFirstLine : oldFirstLine;

      let lineIdx = 0;
      let charIdx = Math.max(0, shortestLine.length);

      rawContentRef.current = shortestLine;

      const typeTick = () => {
        if (_shouldPause(typeTick)) {
          return;
        }

        // All lines were written
        if (lineIdx > maxLineIdx) {
          startBlinkingPhase();
          return;
        }

        const currentLine = lines[lineIdx];
        const lineText = currentLine.text;
        const maxCharIdx = lineText.length - 1;

        // Current line was written
        if (charIdx > maxCharIdx) {
          charIdx = 0;
          lineIdx++;

          if (lineIdx <= maxLineIdx) {
            rawContentRef.current += LINE_BREAK;
          }

          typeTick();
          return;
        }

        let charsToAdd = "";
        let charDelay = currentLine.charDelayMs;

        if (charDelay === ANIMATION_DELAYS_MS.INSTANTANEOUS) {
          charsToAdd += lineText;
          charIdx = maxCharIdx + 1;
        } else {
          // Buffer consecutive whitespaces
          while (charIdx <= maxCharIdx) {
            const char = lineText[charIdx];
            charsToAdd += char;
            charIdx++;

            if (char !== " ") {
              break;
            }
          }
        }

        // Set content
        rawContentRef.current += charsToAdd;
        _setTextarea(textarea, true);

        // Schedule next tick
        if (charDelay === ANIMATION_DELAYS_MS.FAST) {
          charDelay += Math.floor(Math.random() * WELCOME_TYPING_JITTER_MAX_MS);
        }

        activeTimerRef.current = setTimeout(typeTick, charDelay);
      };

      typeTick();
    };

    const startBlinkingPhase = (isInitial = false) => {
      if (isCancelledRef.current) {
        return;
      }

      let showCursor = true;
      const textarea = _getTextarea();

      // Show first blink immediately
      _setTextarea(textarea, true);

      // Start blinking loop
      blinkIntervalRef.current = setInterval(() => {
        if (isCancelledRef.current || document.hidden) {
          return;
        }

        showCursor = !showCursor;
        _setTextarea(textarea, showCursor);
      }, WELCOME_BLINK_INTERVAL_MS);

      // Schedule next animation
      activeTimerRef.current = setTimeout(
        () => {
          if (isCancelledRef.current) {
            return;
          }

          if (blinkIntervalRef.current) {
            clearInterval(blinkIntervalRef.current);
          }

          if (isInitial) {
            startTypingPhase();
          } else {
            startDeletionPhase();
          }
        },
        isInitial
          ? WELCOME_BLINKING_DURATION_MS
          : WELCOME_NEXT_ANIMATION_DELAY_MS,
      );
    };

    const startDeletionPhase = () => {
      if (isCancelledRef.current) {
        return;
      }

      const textarea = _getTextarea();
      const deleteTick = () => {
        if (_shouldPause(deleteTick)) {
          return;
        }

        let currentContent = rawContentRef.current;

        // Strip line break
        if (currentContent.endsWith(LINE_BREAK)) {
          currentContent = currentContent.slice(0, -LINE_BREAK_LENGTH);
        }

        // Leave first line for the next typing phase
        const lastBreakIdx = currentContent.lastIndexOf(LINE_BREAK);
        if (lastBreakIdx === -1) {
          startTypingPhase();
          return;
        }

        // Remove last line
        rawContentRef.current = currentContent.slice(
          0,
          lastBreakIdx + LINE_BREAK_LENGTH,
        );

        _setTextarea(textarea, true);

        // Schedule next tick
        const delay =
          WELCOME_DELETE_LINE_MS +
          Math.floor(Math.random() * WELCOME_DELETION_JITTER_MAX_MS);

        activeTimerRef.current = setTimeout(deleteTick, delay);
      };

      deleteTick();
    };

    // Initial start
    const textarea = _getTextarea();
    _setTextarea(textarea);
    setTimeout(() => startBlinkingPhase(true), WELCOME_START_DELAY_MS);

    return () => {
      if (activeTimerRef.current) {
        cancelWelcomeAnimation();
      }
    };
  }, [_setTextarea, cancelWelcomeAnimation]);

  return { cancelWelcomeAnimation };
}
