import {
    setColor
} from '../common/color_utils.js';
import {
    config,
    DEFAULT_EXPORT_THEME_FILENAME,
    EXPORT_THEME_PROMPT_MESSAGE,
    THEME_BLOB_TYPE,
    THEME_KEYS,
    THEMES_EXTENSION,
    THEMES_FILE_TYPE
} from '../common/config.js';
import {
    CSS
} from '../common/css_classes.js';
import {
    emptyThemeElement,
    themeListElement
} from '../common/elements.js';
import {
    EVENTS
} from '../common/events.js';
import {
    KEYS
} from '../common/keys.js';
import {
    redraw,
} from './canvas_buffer.js';

let _themes = [];
let _activeThemeName = '';
const ACTIVE_THEME_CSS = `.${CSS.THEME_ITEM}.${CSS.THEME_ITEM_ACTIVE}`;

function _getUrlFromObject(object) {
    const blob = new Blob([JSON.stringify(object, null, 2)], THEME_BLOB_TYPE);
    return URL.createObjectURL(blob);
}

function _focusActiveTheme() {
    themeListElement.querySelector(ACTIVE_THEME_CSS)?.focus();
}

function _applyTheme(theme) {
    _activeThemeName = theme._name;
    for (const themeKey of THEME_KEYS) {
        const themeValue = theme[themeKey];
        if (themeValue == null) {
            continue;
        }

        setColor(themeKey, themeValue);
    }

    redraw();
    _renderThemeList();
    _focusActiveTheme();
}

function _applyThemeOnArrow(event, index) {
    if (event.key !== KEYS.ARROW_UP && event.key !== KEYS.ARROW_DOWN) {
        return;
    }

    event.preventDefault();
    if (event.code === KEYS.ARROW_UP) {
        _applyTheme(_themes.at(index - 1));
    }

    if (event.code === KEYS.ARROW_DOWN) {
        _applyTheme(_themes.at((index + 1) % _themes.length))
    };
}

function _showThemeOnNewWindow(theme) {
    const url = _getUrlFromObject(theme);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function _renderThemeList() {
    themeListElement.innerHTML = '';

    if (_themes.length === 0) {
        if (emptyThemeElement) {
            themeListElement.appendChild(emptyThemeElement);
        }

        return;
    }

    _themes.forEach((theme, index) => {
        const themeItem = document.createElement('div');
        const themeName = document.createElement('span');
        const themeSwatch = document.createElement('div');

        themeItem.className = CSS.THEME_ITEM + (theme._name === _activeThemeName ? ` ${CSS.THEME_ITEM_ACTIVE}` : '');
        themeName.className = CSS.THEME_NAME;
        themeSwatch.className = CSS.THEME_SWATCH;

        themeItem.tabIndex = 0;
        themeName.textContent = theme._name;
        themeSwatch.style.background = theme.background;

        themeItem.append(themeName, themeSwatch);
        themeItem.addEventListener(EVENTS.CLICK, () => _applyTheme(theme));
        themeItem.addEventListener(EVENTS.DBL_CLICK, () => _showThemeOnNewWindow(theme));
        themeItem.addEventListener(EVENTS.KEY_DOWN, (event) => _applyThemeOnArrow(event, index));

        themeListElement.appendChild(themeItem);
    });
}

function _mergeTheme(theme, themeName) {
    theme._name = themeName;

    const i = _themes.findIndex(t => t._name === themeName);
    if (i === -1) {
        _themes.push(theme);
        return;
    }

    _themes[i] = theme;
}

async function _onLoadThemes(files) {
    for (const file of files) {
        const theme = JSON.parse(await file.text());
        const themeName = file.name.replace(new RegExp(`${THEMES_EXTENSION}$`, 'i'), '');
        _mergeTheme(theme, themeName);
    }

    if (_themes.length === 0) {
        _renderThemeList();
        return;
    }

    _applyTheme(_themes.at(-1));
}

export async function loadThemes() {
    const inputElement = document.createElement('input');
    inputElement.type = THEMES_FILE_TYPE;
    inputElement.accept = THEMES_EXTENSION;
    inputElement.multiple = true;
    inputElement.addEventListener(EVENTS.CHANGE, () => _onLoadThemes(inputElement.files));
    inputElement.click();
}

export function exportCurrentTheme() {
    const filename = prompt(EXPORT_THEME_PROMPT_MESSAGE, _activeThemeName || DEFAULT_EXPORT_THEME_FILENAME);
    if (!filename) {
        return;
    }

    const anchorElement = document.createElement('a');
    anchorElement.href = _getUrlFromObject(config.colors);
    anchorElement.download = filename.endsWith(THEMES_EXTENSION) ? filename : `${filename}${THEMES_EXTENSION}`;
    anchorElement.click();
    setTimeout(() => URL.revokeObjectURL(anchorElement.href), 1000);
}

export function onThemesFocus(event) {
    if (event.code !== KEYS.TAB) {
        return;
    }

    event.preventDefault();
    _focusActiveTheme();
}