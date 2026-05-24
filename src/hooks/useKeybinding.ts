import { type RefObject, useEffect, useRef } from "react";
import { EVENTS } from "../common/constants/events";
import { matchesKeybinding } from "../common/keybindings";

interface KeybindingOptions {
  preventDefault?: boolean;
  targetRef?: RefObject<HTMLElement | null>;
}

export function useKeybinding(
  bindingId: string,
  callback: (event: KeyboardEvent) => void,
  { preventDefault = true, targetRef }: KeybindingOptions = {},
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const targetElement = targetRef?.current ?? document;
    if (!targetElement) {
      return;
    }

    const handler = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (!matchesKeybinding(keyboardEvent, bindingId)) {
        return;
      }

      if (preventDefault) {
        keyboardEvent.preventDefault();
      }

      savedCallback.current(keyboardEvent);
    };

    targetElement.addEventListener(EVENTS.KEY_DOWN, handler);
    return () => {
      targetElement.removeEventListener(EVENTS.KEY_DOWN, handler);
    };
  }, [bindingId, preventDefault, targetRef]);
}
