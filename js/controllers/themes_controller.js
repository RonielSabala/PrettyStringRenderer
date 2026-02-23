import {
    config,
    THEME_KEYS
} from '../common/config.js';
import {
    setColor
} from './render_controller.js';

let themes = [];
let activeThemeName = '';

const themeList = document.getElementById('theme-list');
const emptyTheme = document.getElementById('theme-empty');

function _onApplyTheme(theme) {
    activeThemeName = theme._name;
    for (const key of THEME_KEYS) {
        if (!theme[key]) {
            continue;
        }

        setColor(key, theme[key]);
    }

    renderThemeList();
}

function renderThemeList() {
    themeList.innerHTML = '';

    if (themes.length === 0) {
        if (emptyTheme) {
            themeList.appendChild(emptyTheme);
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
        themeItem.addEventListener('click', () => _onApplyTheme(theme));

        themeList.appendChild(themeItem);
    }
}

function _appendTheme(theme, themeName) {
    theme._name = themeName;

    const i = themes.findIndex(theme => theme._name === themeName);
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
            _appendTheme(theme, themeName);
        } catch (e) {
            console.warn(`Skipping "${file.name}":`, e);
        }
    }

    renderThemeList();
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

    const blob = new Blob([JSON.stringify(config.colors, null, 2)], {
        type: 'application/json'
    });

    const anchorElement = document.createElement('a');
    anchorElement.href = URL.createObjectURL(blob);
    anchorElement.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    anchorElement.click();
    URL.revokeObjectURL(anchorElement.href);
}

export {
    exportCurrentTheme,
    loadThemes,
    renderThemeList,
    themes
};