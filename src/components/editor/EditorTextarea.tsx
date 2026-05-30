import { forwardRef } from "react";
import {
  APP_FONT_VARIANT_LIGATURES,
  EDITOR_DEFAULTS,
  EDITOR_LETTER_SPACING,
  EDITOR_LINE_HEIGHT,
} from "../../common/config";
import { DOM_IDS } from "../../common/constants/dom";
import { toPx } from "../../utils/resolution";
import "./EditorTextarea.css";

interface Props {
  fontSize: number;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClick: () => void;
  onKeyUp: () => void;
  onFocus: () => void;
}

export const EditorTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ fontSize, onChange, onClick, onKeyUp, onFocus }, ref) => (
    <textarea
      id={DOM_IDS.EDITOR_TEXTAREA}
      className="scroll-container"
      ref={ref}
      spellCheck={false}
      style={{
        fontSize: toPx(fontSize),
        lineHeight: EDITOR_LINE_HEIGHT,
        letterSpacing: EDITOR_LETTER_SPACING,
        fontVariantLigatures: APP_FONT_VARIANT_LIGATURES,
        padding: `${toPx(EDITOR_DEFAULTS.padX)} ${toPx(EDITOR_DEFAULTS.padY)}`,
      }}
      onChange={onChange}
      onClick={onClick}
      onKeyUp={onKeyUp}
      onFocus={onFocus}
    />
  ),
);
