import {
    setColor
} from '../common/color_utils.js';
import {
    config,
    DEFAULT_EXPORT_THEME_NAME,
    THEME_KEYS
} from '../common/config.js';
import {
    emptyThemeElement,
    themeListElement
} from '../common/elements.js';
import {
    KEYS
} from '../common/keys.js';
import {
    redraw,
} from './render_controller.js';

let _themes = [];
let _activeThemeName = '';

function _getUrlFromObject(object) {
    const blob = new Blob([JSON.stringify(object, null, 2)], {
        type: 'application/json'
    });

    return URL.createObjectURL(blob);
}

function _focusActiveTheme() {
    themeListElement.querySelector('.theme-item.active')?.focus();
}

function _applyTheme(theme) {
    _activeThemeName = theme._name;
    for (const themeKey of THEME_KEYS) {
        const themeValue = theme[themeKey];
        if (themeValue === null) {
            continue;
        }

        setColor(themeKey, themeValue);
    }

    redraw();
    _renderHtmlThemeList();
    _focusActiveTheme();
}

function _applyThemeOnArrow(event, index) {
    if (event.code !== KEYS.ARROW_UP && event.code !== KEYS.ARROW_DOWN) {
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
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function _renderHtmlThemeList() {
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
        const themeDot = document.createElement('div');

        themeItem.className = 'theme-item' + (theme._name === _activeThemeName ? ' active' : '');
        themeName.className = 'theme-name';
        themeDot.className = 'theme-dot';

        themeItem.tabIndex = 0;
        themeName.textContent = theme._name;
        themeDot.style.background = theme.background;

        themeItem.append(themeName, themeDot);
        themeItem.addEventListener('click', () => _applyTheme(theme));
        themeItem.addEventListener('dblclick', () => _showThemeOnNewWindow(theme));
        themeItem.addEventListener('keydown', (event) => _applyThemeOnArrow(event, index));

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
        try {
            const theme = JSON.parse(await file.text());
            const themeName = file.name.replace(/\.json$/i, '');
            _mergeTheme(theme, themeName);
        } catch (e) {
            console.warn(`
            Skipping "${file.name}": `, e);
        }
    }

    if (_themes.length === 0) {
        _renderHtmlThemeList();
        return;
    }

    _applyTheme(_themes.at(-1));
}

export async function loadThemes() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = '.json';
    inputElement.multiple = true;
    inputElement.addEventListener('change', () => _onLoadThemes(inputElement.files));
    inputElement.click();
}

export function exportCurrentTheme() {
    const filename = prompt('Theme name:', _activeThemeName || DEFAULT_EXPORT_THEME_NAME);
    if (!filename) {
        return;
    }

    const anchorElement = document.createElement('a');
    anchorElement.href = _getUrlFromObject(config.colors);
    anchorElement.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    anchorElement.click();
    setTimeout(() => URL.revokeObjectURL(anchorElement.href), 1000);
}

export function onThemesFocus(event) {
    if (event.code !== KEYS.T) {
        return;
    }

    event.preventDefault();
    _focusActiveTheme();
}