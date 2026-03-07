import {
    SAVE_TIMEOUT_MS
} from '../common/config.js';
import {
    state
} from '../common/store.js';

const STORAGE_KEYS = Object.freeze({
    COLORS: 'psr:colors',
    THEMES: 'psr:themes',
    ACTIVE_THEME_NAME: 'psr:activeThemeName',
    ACTIVE_ELEMENT_ID: 'psr:activeElementID',
    COLLAPSED_SECTION_IDS: 'psr:collapsedSectionIds',
    TYPOGRAPHY_CONFIG: 'psr:typographyConfig',
    EDITOR_CONFIG: 'psr:editorConfig',
    CANVAS_CONFIG: 'psr:canvasConfig',
});

export function createSaveScheduler(saveFn, ms = SAVE_TIMEOUT_MS) {
    let timer = null;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(saveFn, ms);
    };
}

// Internal helpers

function _saveAsync(key, value) {
    setTimeout(() => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('Could not save state:', error);
        }
    }, 0);
}

function _saveObjectAsync(key, value) {
    _saveAsync(key, JSON.stringify(value));
}

function _getState(key) {
    return localStorage.getItem(key);
}

function _restoreStateToObject(current, savedJSON) {
    if (!savedJSON) {
        return;
    }

    try {
        Object.assign(current, JSON.parse(savedJSON));
    } catch (error) {
        console.warn('Could not parse saved state:', error);
    }
}

// Public save functions

export const saveColorsState = () => _saveObjectAsync(STORAGE_KEYS.COLORS, state.colors);
export const saveThemesState = () => _saveObjectAsync(STORAGE_KEYS.THEMES, state.themes);
export const saveActiveThemeNameState = () => _saveAsync(STORAGE_KEYS.ACTIVE_THEME_NAME, state.activeThemeName);
export const saveActiveElementIdState = () => _saveAsync(STORAGE_KEYS.ACTIVE_ELEMENT_ID, state.activeElementId);
export const saveCollapsedSectionIdsState = () => _saveObjectAsync(STORAGE_KEYS.COLLAPSED_SECTION_IDS, state.collapsedSectionIds);
export const saveTypographyConfigState = () => _saveObjectAsync(STORAGE_KEYS.TYPOGRAPHY_CONFIG, state.typographyConfig);
export const saveEditorConfigState = () => _saveObjectAsync(STORAGE_KEYS.EDITOR_CONFIG, state.editorConfig);
export const saveCanvasConfigState = () => _saveObjectAsync(STORAGE_KEYS.CANVAS_CONFIG, state.canvasConfig);

export function restoreState() {
    try {
        _restoreStateToObject(state.colors, _getState(STORAGE_KEYS.COLORS));
        _restoreStateToObject(state.themes, _getState(STORAGE_KEYS.THEMES));
        _restoreStateToObject(state.collapsedSectionIds, _getState(STORAGE_KEYS.COLLAPSED_SECTION_IDS));
        _restoreStateToObject(state.typographyConfig, _getState(STORAGE_KEYS.TYPOGRAPHY_CONFIG));
        _restoreStateToObject(state.editorConfig, _getState(STORAGE_KEYS.EDITOR_CONFIG));
        _restoreStateToObject(state.canvasConfig, _getState(STORAGE_KEYS.CANVAS_CONFIG));

        const activeThemeName = _getState(STORAGE_KEYS.ACTIVE_THEME_NAME);
        const activeElementId = _getState(STORAGE_KEYS.ACTIVE_ELEMENT_ID);
        if (activeThemeName) state.activeThemeName = activeThemeName;
        if (activeElementId) state.activeElementId = activeElementId;
    } catch (err) {
        console.warn('Could not restore state:', err);
    }
}

export function clearState() {
    localStorage.clear();
}