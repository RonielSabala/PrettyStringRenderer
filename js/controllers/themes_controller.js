import {
    config,
    THEME_KEYS
} from '../common/config.js';
import {
    emptyThemeElement,
    themeListElement
} from '../common/elements.js';
import {
    setColor
} from './render_controller.js';

let themes = [];
let activeThemeName = '';

function _getUrlFromObject(object) {
    const blob = new Blob([JSON.stringify(object, null, 2)], {
        type: 'application/json'
    });

    return URL.createObjectURL(blob);
}

function _applyTheme(theme) {
    activeThemeName = theme._name;
    for (const themeKey of THEME_KEYS) {
        const themeValue = theme[themeKey];
        if (themeValue === null) {
            continue;
        }

        setColor(themeKey, themeValue);
    }

    renderThemeList();
}

function _showThemeOnNewWindow(theme) {
    const url = _getUrlFromObject(theme);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderThemeList() {
    themeListElement.innerHTML = '';

    if (themes.length === 0) {
        if (emptyThemeElement) {
            themeListElement.appendChild(emptyThemeElement);
        }

        return;
    }

    for (const theme of themes) {
        const themeItem = document.createElement('div');
        const themeName = document.createElement('span');
        const themeDot = document.createElement('div');

        themeItem.className = 'theme-item' + (theme._name === activeThemeName ? ' active' : '');
        themeName.className = 'theme-name';
        themeDot.className = 'theme-dot';

        themeName.textContent = theme._name;
        themeDot.style.background = theme.background;

        themeItem.append(themeName, themeDot);
        themeItem.addEventListener('click', () => _applyTheme(theme));
        themeItem.addEventListener('dblclick', () => _showThemeOnNewWindow(theme));

        themeListElement.appendChild(themeItem);
    }
}

function _mergeTheme(theme, themeName) {
    theme._name = themeName;

    const i = themes.findIndex(t => t._name === themeName);
    if (i === -1) {
        themes.push(theme);
        return;
    }

    themes[i] = theme;
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

    if (themes.length === 0) {
        renderThemeList();
        return;
    }

    _applyTheme(themes.at(-1));
}

async function loadThemes() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = '.json';
    inputElement.multiple = true;
    inputElement.addEventListener('change', () => _onLoadThemes(inputElement.files));
    inputElement.click();
}

function exportCurrentTheme() {
    const filename = prompt('Theme name:', activeThemeName || 'my-theme');
    if (!filename) {
        return;
    }

    const anchorElement = document.createElement('a');
    anchorElement.href = _getUrlFromObject(config.colors);
    anchorElement.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    anchorElement.click();
    setTimeout(() => URL.revokeObjectURL(anchorElement.href), 1000);
}

export {
    exportCurrentTheme,
    loadThemes,
    renderThemeList,
    themes
};