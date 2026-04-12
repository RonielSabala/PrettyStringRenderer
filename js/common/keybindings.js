import _defaults from '../../userData/keybindings.example.json';

const _userFile = import.meta.glob('../../userData/keybindings.json', {
    eager: true
});
const _user = _userFile['../../userData/keybindings.json']?.default ?? {};

export const KEYBINDINGS = Object.freeze({
    ..._defaults,
    ..._user
});

const KEY_ALIASES = {
    'space': ' ',
};

function _parse(binding) {
    const parts = binding.toLowerCase().split('+');
    const rawKey = parts.at(-1);
    return {
        ctrl: parts.includes('ctrl'),
        shift: parts.includes('shift'),
        alt: parts.includes('alt'),
        key: KEY_ALIASES[rawKey] ?? rawKey,
    };
}

export function matchesKeybinding(event, bindingId) {
    const binding = KEYBINDINGS[bindingId];
    if (!binding) {
        return false;
    }

    const {
        ctrl,
        shift,
        alt,
        key
    } = _parse(binding);
    return (
        event.key.toLowerCase() === key &&
        !!event.ctrlKey === ctrl &&
        !!event.shiftKey === shift &&
        !!event.altKey === alt
    );
}
