import {
    redraw,
} from '../canvas/buffer.js';
import {
    DEFAULT_EXPORT_THEME_FILENAME,
    EXPORT_THEME_PROMPT_MESSAGE,
    THEME_BLOB_TYPE,
    THEME_KEYS,
    THEMES_EXTENSION,
    THEMES_FILE_TYPE
} from '../common/config.js';
import {
    CSS
} from '../common/constants/css.js';
import {
    EVENTS
} from '../common/constants/events.js';
import {
    KEYS
} from '../common/constants/keys.js';
import {
    emptyThemeElement,
    themeListElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    setColor,
    updateTokensColor
} from '../utils/color.js';

const ACTIVE_THEME_CSS = `.${CSS.THEME_ITEM}.${CSS.THEME_ITEM_ACTIVE}`;

function _getUrlFromObject(object) {
    const blob = new Blob([JSON.stringify(object, null, 2)], THEME_BLOB_TYPE);
    return URL.createObjectURL(blob);
}

function _focusActiveTheme() {
    themeListElement.querySelector(ACTIVE_THEME_CSS)?.focus();
}

function _applyTheme(theme) {
    state.activeThemeName = theme._name;
    for (const themeKey of THEME_KEYS) {
        const themeValue = theme[themeKey];
        if (themeValue == null) {
            continue;
        }

        setColor(themeKey, themeValue);
    }

    _renderThemeList();
    _focusActiveTheme();
    updateTokensColor();
    redraw();
}

function _applyThemeOnArrow(event, index) {
    if (event.key !== KEYS.ARROW_UP && event.key !== KEYS.ARROW_DOWN) {
        return;
    }

    event.preventDefault();
    const themes = state.themes;

    if (event.code === KEYS.ARROW_UP) {
        _applyTheme(themes.at(index - 1));
    }

    if (event.code === KEYS.ARROW_DOWN) {
        _applyTheme(themes.at((index + 1) % themes.length))
    };
}

function _showThemeOnNewWindow(theme) {
    const url = _getUrlFromObject(theme);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function _renderThemeList() {
    themeListElement.innerHTML = '';
    const themes = state.themes;

    if (themes.length === 0) {
        if (emptyThemeElement) {
            themeListElement.appendChild(emptyThemeElement);
        }

        return;
    }

    themes.forEach((theme, index) => {
        const themeItem = document.createElement('div');
        const themeName = document.createElement('span');
        const themeSwatch = document.createElement('div');

        themeItem.className = CSS.THEME_ITEM + (theme._name === state.activeThemeName ? ` ${CSS.THEME_ITEM_ACTIVE}` : '');
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
    let themes = state.themes;
    const i = themes.findIndex(t => t._name === themeName);

    if (i === -1) {
        themes.push(theme);
        return;
    }

    themes[i] = theme;
}

async function _onLoadThemes(files) {
    for (const file of files) {
        const theme = JSON.parse(await file.text());
        const themeName = file.name.replace(new RegExp(`${THEMES_EXTENSION}$`, 'i'), '');
        _mergeTheme(theme, themeName);
    }

    const themes = state.themes;
    if (themes.length === 0) {
        _renderThemeList();
        return;
    }

    _applyTheme(themes.at(-1));
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
    const filename = prompt(EXPORT_THEME_PROMPT_MESSAGE, state.activeThemeName || DEFAULT_EXPORT_THEME_FILENAME);
    if (!filename) {
        return;
    }

    const anchorElement = document.createElement('a');
    anchorElement.href = _getUrlFromObject(state.colors);
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