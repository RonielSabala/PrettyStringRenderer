import {
    redraw,
} from '../canvas/buffer.js';
import {
    DEFAULT_EXPORT_THEME_FILENAME,
    DEFAULT_THEME,
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
    btnExportTheme,
    btnLoadThemes,
    emptyThemeElement,
    themeListElement
} from '../common/elements.js';
import {
    state
} from '../common/store.js';
import {
    setColor,
    updateTokensColor
} from '../utils/color_sync.js';
import {
    isObjectEmpty
} from '../utils/parse.js';
import {
    createSaveScheduler,
    saveActiveThemeNameState,
    saveColorsState,
    saveThemesState
} from '../utils/persistence.js';

const ACTIVE_THEME_CSS = `.${CSS.THEME_ITEM}.${CSS.THEME_ITEM_ACTIVE}`;
const _scheduleColorSave = createSaveScheduler(saveColorsState);
const _scheduleActiveThemeNameSave = createSaveScheduler(saveActiveThemeNameState);

// Helpers

function _getUrlFromObject(object) {
    const blob = new Blob([JSON.stringify(object, null, 2)], THEME_BLOB_TYPE);
    return URL.createObjectURL(blob);
}

function _focusActiveTheme() {
    themeListElement.querySelector(ACTIVE_THEME_CSS)?.focus();
}

function _applyTheme(theme) {
    for (const themeKey of THEME_KEYS) {
        const themeValue = theme[themeKey];
        if (themeValue == null) {
            continue;
        }

        setColor(themeKey, themeValue);
    }

    state.activeThemeName = theme._name;
    _scheduleActiveThemeNameSave();
    _scheduleColorSave();
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

    let i;
    const themes = state.themes;
    switch (event.key) {
        case KEYS.ARROW_UP:
            i = index - 1;
            break;
        case KEYS.ARROW_DOWN:
            i = (index + 1) % themes.length;
            break;
        default:
            return;
    }

    _applyTheme(themes.at(i));
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
        const themeName = theme._name;
        const themeItemClass = CSS.THEME_ITEM + (themeName === state.activeThemeName ? ` ${CSS.THEME_ITEM_ACTIVE}` : '');

        const themeItemElement = document.createElement('div');
        const themeNameElement = document.createElement('span');
        const themeSwatchElement = document.createElement('div');

        themeNameElement.className = CSS.THEME_NAME;
        themeNameElement.textContent = themeName;

        themeSwatchElement.className = CSS.THEME_SWATCH;
        themeSwatchElement.style.background = theme.background;

        themeItemElement.tabIndex = 0;
        themeItemElement.id = `${themeItemClass}-${themeName.toLowerCase()}`;
        themeItemElement.className = themeItemClass;
        themeItemElement.append(themeNameElement, themeSwatchElement);
        themeItemElement.addEventListener(EVENTS.CLICK, () => _applyTheme(theme));
        themeItemElement.addEventListener(EVENTS.DBL_CLICK, () => _showThemeOnNewWindow(theme));
        themeItemElement.addEventListener(EVENTS.KEY_DOWN, (event) => _applyThemeOnArrow(event, index));

        themeListElement.appendChild(themeItemElement);
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

async function _loadThemes(files) {
    for (const file of files) {
        const theme = JSON.parse(await file.text());
        const themeName = file.name.replace(new RegExp(`${THEMES_EXTENSION}$`, 'i'), '');
        _mergeTheme(theme, themeName);
    }

    saveThemesState();

    const themes = state.themes;
    if (themes.length === 0) {
        _renderThemeList();
        return;
    }

    _applyTheme(themes.at(-1));
}

// Listeners

function _onLoadThemes() {
    const inputElement = document.createElement('input');
    inputElement.type = THEMES_FILE_TYPE;
    inputElement.accept = THEMES_EXTENSION;
    inputElement.multiple = true;
    inputElement.addEventListener(EVENTS.CHANGE, () => _loadThemes(inputElement.files));
    inputElement.click();
}

function _onExportTheme() {
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

function _onThemesFocus(event) {
    if (event.code !== KEYS.TAB) {
        return;
    }

    event.preventDefault();
    _focusActiveTheme();
}

// Public methods

export function initThemesSection(signal) {
    _renderThemeList();

    // Apply theme

    const colors = state.colors;
    const themeToApply = isObjectEmpty(colors) ? DEFAULT_THEME : colors;

    for (const [ThemeKey, ThemeValue] of Object.entries(themeToApply)) {
        setColor(ThemeKey, ThemeValue);
    }

    // Listeners
    btnLoadThemes.addEventListener(EVENTS.CLICK, _onLoadThemes, {
        signal
    });
    btnExportTheme.addEventListener(EVENTS.CLICK, _onExportTheme, {
        signal
    });
    document.addEventListener(EVENTS.KEY_DOWN, _onThemesFocus, {
        signal
    })
}
