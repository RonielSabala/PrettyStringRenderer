import { useCallback, useEffect, useRef } from "react";
import {
  HAS_CUSTOM_PROFILE,
  LINE_BREAK,
  SAVE_TIMEOUT_MS,
  WELCOME_ANIMATION_START_DELAY_MS,
  WELCOME_BLINK_INTERVAL_MS,
  WELCOME_CURSOR_CHAR,
  WELCOME_DELETION_JITTER_MAX_MS,
  WELCOME_DELETION_SPEED_MS,
  WELCOME_NEXT_ANIMATION_DELAY_MS,
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
        rawContentRef.current + (showCursor ? WELCOME_CURSOR_CHAR : "");

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

      rawContentRef.current = "";

      let charIdx = 0;
      let tokenIdx = 0;
      const tokens = generateWelcomeTokens();
      const textarea = getTextarea();

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

        // If all text is gone, start the next typing cycle
        if (rawContentRef.current === "") {
          runAnimationCycle();
          return;
        }

        // Pop the bottom line off the string
        const lines = rawContentRef.current.split(LINE_BREAK);
        lines.pop();
        rawContentRef.current = lines.join(LINE_BREAK);

        setTextarea(textarea, true);

        const deleteDelay =
          WELCOME_DELETION_SPEED_MS +
          Math.floor(Math.random() * WELCOME_DELETION_JITTER_MAX_MS);

        activeTimerRef.current = setTimeout(deleteTick, deleteDelay);
      };

      deleteTick();
    };

    const startBlinkingPhase = () => {
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

      // Schedule reset for next animation
      activeTimerRef.current = setTimeout(() => {
        if (isCancelledRef.current) {
          return;
        }

        if (blinkIntervalRef.current) {
          clearInterval(blinkIntervalRef.current);
        }

        startDeletionPhase();
      }, WELCOME_NEXT_ANIMATION_DELAY_MS);
    };

    // Initial start
    setTimeout(runAnimationCycle, WELCOME_ANIMATION_START_DELAY_MS);

    // Cleanup on unmount
    return () => {
      if (activeTimerRef.current) {
        cancelWelcomeAnimation();
      }
    };
  }, [setTextarea, cancelWelcomeAnimation]);

  return { cancelWelcomeAnimation };
}
