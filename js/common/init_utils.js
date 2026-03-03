import {
    CSS
} from "./css_classes.js";

export function initNumberInput(element, dataContainer) {
    element.value = dataContainer.value;
    element.min = dataContainer.min;
    element.max = dataContainer.max;
    element.step = dataContainer?.step ?? 1;
}

export function toggleSection(element) {
    element.classList.toggle(CSS.COLLAPSED_HEADER);
    element.nextElementSibling.classList.toggle(CSS.HIDDEN_BODY);
}