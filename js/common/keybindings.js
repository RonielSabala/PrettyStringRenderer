import _defaultsKeybindings from '../../userData/keybindings.example.json';

const _userFile = import.meta.glob('../../userData/keybindings.json', {
    eager: true
});
const _userKeybindings = _userFile['../../userData/keybindings.json']?.default ?? {};

const _raw = {
    ..._defaultsKeybindings,
    ..._userKeybindings
};

const KEY_ALIASES = {
    'space': ' ',
};

function _parseBinding(binding) {
    const parts = binding.toLowerCase().split('+');
    const rawKey = parts.at(-1);
    return {
        ctrl: parts.includes('ctrl'),
        shift: parts.includes('shift'),
        alt: parts.includes('alt'),
        key: KEY_ALIASES[rawKey] ?? rawKey,
    };
}

// Pre-parsed map
const _parsedKeybindings = Object.freeze(
    Object.fromEntries(Object.entries(_raw).map(([id, binding]) => [id, _parseBinding(binding)]))
);

export function matchesKeybinding(event, bindingId) {
    const binding = _parsedKeybindings[bindingId];
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
