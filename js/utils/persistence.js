import {
    state
} from '../common/store.js';

const STORAGE_KEYS = Object.freeze({
    COLORS: 'psr:colors',
    THEMES: 'psr:themes',
    ACTIVE_THEME_NAME: 'psr:activeThemeName',
    ACTIVE_ELEMENT_ID: 'psr:activeElementID',
    COLLAPSED_SECTION_IDS: 'psr:collapsedSectionIds',
    CONFIG: 'psr:config',
    EDITOR_CONFIG: 'psr:editorConfig',
});

// Helpers

function _saveValueState(storageKey, storageValue) {
    try {
        localStorage.setItem(storageKey, storageValue);
    } catch (error) {
        console.warn('Could not save state:', error);
    }
}

function _saveObjectState(storageKey, storageValue) {
    _saveValueState(storageKey, JSON.stringify(storageValue));
}

function _getState(storageKey) {
    return localStorage.getItem(storageKey);
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

// Public methods

export const saveColorsState = () => _saveObjectState(STORAGE_KEYS.COLORS, state.colors);
export const saveThemesState = () => _saveObjectState(STORAGE_KEYS.THEMES, state.themes);
export const saveActiveThemeNameState = () => _saveValueState(STORAGE_KEYS.ACTIVE_THEME_NAME, state.activeThemeName);
export const saveActiveElementIdState = () => _saveValueState(STORAGE_KEYS.ACTIVE_ELEMENT_ID, state.activeElementId);
export const saveCollapsedSectionIdsState = () => _saveObjectState(STORAGE_KEYS.COLLAPSED_SECTION_IDS, state.collapsedSectionIds);
export const saveConfigState = () => _saveObjectState(STORAGE_KEYS.CONFIG, state.config);
export const saveEditorConfigState = () => _saveObjectState(STORAGE_KEYS.EDITOR_CONFIG, state.editorConfig);

export function restoreState() {
    try {
        const colors = _getState(STORAGE_KEYS.COLORS);
        const themes = _getState(STORAGE_KEYS.THEMES);
        const activeThemeName = _getState(STORAGE_KEYS.ACTIVE_THEME_NAME);
        const activeElementId = _getState(STORAGE_KEYS.ACTIVE_ELEMENT_ID);
        const collapsedSectionIds = _getState(STORAGE_KEYS.COLLAPSED_SECTION_IDS);
        const config = _getState(STORAGE_KEYS.CONFIG);
        const editorConfig = _getState(STORAGE_KEYS.EDITOR_CONFIG);

        _restoreStateToObject(state.colors, colors);
        _restoreStateToObject(state.themes, themes);
        _restoreStateToObject(state.collapsedSectionIds, collapsedSectionIds);
        _restoreStateToObject(state.config, config);
        _restoreStateToObject(state.editorConfig, editorConfig);

        if (activeThemeName) state.activeThemeName = activeThemeName;
        if (activeElementId) state.activeElementId = activeElementId;

    } catch (err) {
        console.warn('Could not restore state:', err);
    }
}