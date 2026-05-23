import _defaults from "../../userData/keybindings.example.json";
import { toTitle } from "../utils/parse";

const _userFile = import.meta.glob("../../userData/keybindings.json", {
  eager: true,
}) as Record<string, { default: typeof _defaults }>;
const _userBindings =
  _userFile["../../userData/keybindings.json"]?.default ?? {};

const _rawBindings: Record<string, string> = {
  ..._defaults,
  ..._userBindings,
};

const BINDING_SEPARATOR = "+";
const MODIFIER_KEYS = ["ctrl", "shift", "alt"] as const;

interface KeyEvent {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

type ModifierKey = (typeof MODIFIER_KEYS)[number];

type ParsedBinding = {
  [K in ModifierKey]: boolean;
} & {
  key: string;
};

const KEY_ALIASES: Record<string, string> = {
  space: " ",
};

function _parseBinding(binding: string): ParsedBinding {
  const parts = binding.toLowerCase().split(BINDING_SEPARATOR);
  const rawKey = parts.at(-1)!;

  const modifiers = Object.fromEntries(
    MODIFIER_KEYS.map((key) => [key, parts.includes(key)]),
  ) as Record<ModifierKey, boolean>;

  return {
    ...modifiers,
    key: KEY_ALIASES[rawKey] ?? rawKey,
  };
}

// Pre-parsed map
const _parsed: Readonly<Record<string, ParsedBinding>> = Object.freeze(
  Object.fromEntries(
    Object.entries(_rawBindings).map(([id, binding]) => [
      id,
      _parseBinding(binding),
    ]),
  ),
);

export function matchesKeybinding(event: KeyEvent, bindingId: string): boolean {
  const binding = _parsed[bindingId];
  if (!binding) {
    return false;
  }

  return (
    event.key.toLowerCase() === binding.key &&
    !!event.ctrlKey === binding.ctrl &&
    !!event.shiftKey === binding.shift &&
    !!event.altKey === binding.alt
  );
}
export function getFormattedKeybinding(bindingId: string): string {
  const binding = _rawBindings[bindingId];
  if (!binding) {
    return "";
  }

  return binding
    .split(BINDING_SEPARATOR)
    .map((key) => `[${toTitle(key)}]`)
    .join(` ${BINDING_SEPARATOR} `);
}
