import { useCallback, useEffect, useRef } from "react";
import {
  HAS_CUSTOM_PROFILE,
  LINE_BREAK,
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
import { useStore } from "../common/store";
import { ANIMATION_DELAYS_MS, generateWelcomeTokens } from "./tokens_generator";

export function useWelcomeAnimation() {
  const setEditorConfig = useStore((state) => state.setEditorConfig);

  const hasRunRef = useRef(false);
  const isCancelledRef = useRef(false);

  // Timers
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Raw text without the cursor character
  const rawContentRef = useRef("");

  // Helpers

  const getTextarea = () =>
    document.getElementById("editor") as HTMLTextAreaElement | null;

  const setTextarea = useCallback(
    (textarea: HTMLTextAreaElement | null, showCursor: boolean = false) => {
      const newContent =
        rawContentRef.current + (showCursor ? WELCOME_CURSOR_CHAR : " ");

      if (textarea) {
        textarea.value = newContent;
      }

      setEditorConfig({ content: newContent });
    },
    [setEditorConfig],
  );

  const pauseIfHidden = (callback: () => void): boolean => {
    const isHidden = document.hidden;
    if (isHidden) {
      activeTimerRef.current = setTimeout(callback, SAVE_TIMEOUT_MS);
    }

    return isHidden;
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

    // Strip cursor
    const textarea = getTextarea();
    if (textarea && textarea.value.endsWith(WELCOME_CURSOR_CHAR)) {
      setTextarea(textarea);
    }
  }, [setTextarea]);

  useEffect(() => {
    if (
      HAS_CUSTOM_PROFILE ||
      hasRunRef.current ||
      useStore.getState().editorConfig.content
    ) {
      return;
    }

    hasRunRef.current = true;

    const runAnimationCycle = () => {
      if (isCancelledRef.current) {
        return;
      }

      const textarea = getTextarea();
      const tokens = generateWelcomeTokens();

      const currentText = rawContentRef.current;
      const newText = tokens[0].text;
      const shortest =
        newText.length < currentText.length ? newText : currentText;

      let tokenIdx = 0;
      let charIdx = Math.max(0, shortest.length - 1);
      rawContentRef.current = shortest.replace(LINE_BREAK, "");

      const typeTick = () => {
        if (isCancelledRef.current || pauseIfHidden(typeTick)) {
          return;
        }

        if (tokenIdx >= tokens.length) {
          startBlinkingPhase();
          return;
        }

        const token = tokens[tokenIdx];
        const tokenText = token.text;
        let currentDelay = token.delayMs;

        // Instant token handling
        if (currentDelay === ANIMATION_DELAYS_MS.INSTANTANEOUS) {
          rawContentRef.current += tokenText;
          charIdx = 0;
          tokenIdx++;

          setTextarea(textarea, true);
          typeTick();
          return;
        }

        const tokenLength = tokenText.length;
        if (charIdx >= tokenLength) {
          charIdx = 0;
          tokenIdx++;
          typeTick();
          return;
        }

        // Buffer all consecutive whitespaces
        let charsToAdd = "";
        while (charIdx < tokenLength) {
          const char = tokenText[charIdx];
          charsToAdd += char;
          charIdx++;

          if (char.trim() !== "") {
            break;
          }
        }

        rawContentRef.current += charsToAdd;
        setTextarea(textarea, true);

        if (currentDelay === ANIMATION_DELAYS_MS.FAST) {
          currentDelay += Math.floor(
            Math.random() * WELCOME_TYPING_JITTER_MAX_MS,
          );
        }

        activeTimerRef.current = setTimeout(typeTick, currentDelay);
      };

      typeTick();
    };

    const startDeletionPhase = () => {
      if (isCancelledRef.current) {
        return;
      }

      const textarea = getTextarea();

      const deleteTick = () => {
        if (isCancelledRef.current || pauseIfHidden(deleteTick)) {
          return;
        }

        let currentContent = rawContentRef.current;

        // Ignore last line break
        if (currentContent.endsWith(LINE_BREAK)) {
          currentContent = currentContent.slice(0, -LINE_BREAK.length);
        }

        const lastBreakIdx = currentContent.lastIndexOf(LINE_BREAK);
        if (lastBreakIdx === -1) {
          runAnimationCycle();
          return;
        }

        // Remove bottom line
        rawContentRef.current = currentContent.slice(
          0,
          lastBreakIdx + LINE_BREAK.length,
        );

        setTextarea(textarea, true);

        const deleteDelay =
          WELCOME_DELETE_LINE_MS +
          Math.floor(Math.random() * WELCOME_DELETION_JITTER_MAX_MS);

        activeTimerRef.current = setTimeout(deleteTick, deleteDelay);
      };

      deleteTick();
    };

    const startBlinkingPhase = (isInitial = false) => {
      if (isCancelledRef.current) {
        return;
      }

      let showCursor = true;
      const textarea = getTextarea();

      // Render first blink immediately
      setTextarea(textarea, true);

      // Start blinking loop
      blinkIntervalRef.current = setInterval(() => {
        if (isCancelledRef.current || document.hidden) {
          return;
        }

        showCursor = !showCursor;
        setTextarea(textarea, showCursor);
      }, WELCOME_BLINK_INTERVAL_MS);

      const nextDelay = isInitial
        ? WELCOME_BLINKING_DURATION_MS
        : WELCOME_NEXT_ANIMATION_DELAY_MS;

      activeTimerRef.current = setTimeout(() => {
        if (isCancelledRef.current) {
          return;
        }

        if (blinkIntervalRef.current) {
          clearInterval(blinkIntervalRef.current);
        }

        if (isInitial) {
          runAnimationCycle();
        } else {
          startDeletionPhase();
        }
      }, nextDelay);
    };

    // Initial start
    const textarea = getTextarea();
    setTextarea(textarea);
    setTimeout(() => startBlinkingPhase(true), WELCOME_START_DELAY_MS);

    // Cleanup on unmount
    return () => {
      if (activeTimerRef.current) {
        cancelWelcomeAnimation();
      }
    };
  }, [setTextarea, cancelWelcomeAnimation]);

  return { cancelWelcomeAnimation };
}
