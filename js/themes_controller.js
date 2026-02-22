import {
    COLOR_KEYS,
    config
} from "./config.js";

import {
    renderOpChips,
    setColor,
} from "./render_controller.js";

let themes = [];
let activeThemeName = '';

function _applyTheme(theme) {
    for (const key of COLOR_KEYS) {
        if (!theme[key]) {
            continue;
        }

        setColor(key, theme[key]);
    }

    if (theme.background) {
        setColor('background', theme.background, true);
    }

    // Ensure operator chips reflect the new operator color
    renderOpChips();
}

function renderThemeList() {
    const list = document.getElementById('theme-list');
    const empty = document.getElementById('theme-empty');
    list.innerHTML = '';

    if (themes.length === 0) {
        if (empty) {
            list.appendChild(empty);
        }

        return;
    }

    for (const theme of themes) {
        const item = document.createElement('div');
        item.className = 'theme-item' + (theme._name === activeThemeName ? ' active' : '');

        const name = document.createElement('span');
        name.className = 'theme-name';
        name.textContent = theme._name;

        const dot = document.createElement('div');
        dot.className = 'theme-dot';
        dot.style.background = theme.background || '#1e1e1e';

        item.append(name, dot);
        item.addEventListener('click', () => {
            activeThemeName = theme._name;
            _applyTheme(theme);
            renderThemeList();
        });

        list.appendChild(item);
    }
}

async function importThemes() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.json';

    input.addEventListener('change', async () => {
        for (const file of input.files) {
            try {
                const json = JSON.parse(await file.text());
                json._name = file.name.replace(/\.json$/i, '');

                const idx = themes.findIndex(x => x._name === json._name);
                if (idx >= 0) {
                    themes[idx] = json;
                } else {
                    themes.push(json);
                }
            } catch (e) {
                console.warn('Skipping', file.name, e);
            }
        }

        renderThemeList();
    });

    input.click();
}

function exportCurrentTheme() {
    const name = prompt('Theme name:', activeThemeName || 'my-theme');
    if (!name) {
        return;
    }

    const blob = new Blob([JSON.stringify(config.colors, null, 2)], {
        type: 'application/json'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = name.endsWith('.json') ? name : name + '.json';
    anchor.click();

    URL.revokeObjectURL(anchor.href);
}

export {
    exportCurrentTheme,
    importThemes,
    renderThemeList,
    themes
};