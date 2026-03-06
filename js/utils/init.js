import {
    CSS
} from '../common/constants/css.js';
import {
    state
} from '../common/store.js';
import {
    saveCollapsedSectionIdsState
} from './persistence.js';

export function baseToggleSection(element) {
    element.classList.toggle(CSS.COLLAPSED_HEADER);
    element.nextElementSibling.classList.toggle(CSS.HIDDEN_BODY);
}

export function toggleSection(element) {
    baseToggleSection(element);

    const id = element.id;
    const sections = state.collapsedSectionIds;
    sections[id] = !sections[id];
    saveCollapsedSectionIdsState();
}

export function initNumberInput(element, value, rangeConfig) {
    element.value = value;
    element.min = rangeConfig.min;
    element.max = rangeConfig.max;
    element.step = rangeConfig?.step ?? 1;
}