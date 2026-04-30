import _defaults from "../../userData/keybindings.example.json";

const _userFile = import.meta.glob("../../userData/keybindings.json", {
  eager: true,
}) as Record<string, { default: typeof _defaults }>;
const _userBindings =
  _userFile["../../userData/keybindings.json"]?.default ?? {};

const _rawBindings: Record<string, string> = {
  ..._defaults,
  ..._userBindings,
};

const KEY_ALIASES: Record<string, string> = {
  space: " ",
};

interface ParsedBinding {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
}

function _parseBinding(binding: string): ParsedBinding {
  const parts = binding.toLowerCase().split("+");
  const rawKey = parts.at(-1)!;
  return {
    ctrl: parts.includes("ctrl"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
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

export function matchesKeybinding(
  event: KeyboardEvent,
  bindingId: string,
): boolean {
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
