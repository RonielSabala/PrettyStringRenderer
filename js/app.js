import {
    redraw
} from './canvas/buffer.js';
import {
    initCanvas
} from './canvas/controller.js';
import {
    CSS
} from './common/constants/css.js';
import {
    EVENTS
} from './common/constants/events.js';
import {
    editorElement,
    getElement,
    RELOAD_FOCUS_EXCLUSIONS,
    resetButtonElement,
    resolutionBadgeElement,
    sectionBracketColors,
    sectionCanvasColors,
    sectionSyntaxColors
} from './common/elements.js';
import {
    state
} from './common/store.js';
import {
    initColors
} from './features/color.js';
import {
    initEditorSection
} from './features/editor.js';
import {
    initExport
} from './features/export.js';
import {
    initThemesSection
} from './features/themes.js';
import {
    initTypographySection
} from './features/typography.js';
import {
    baseToggleSection,
    toggleSection
} from './utils/init.js';
import {
    isObjectEmpty
} from './utils/parse.js';
import {
    clearState,
    restoreState,
    saveActiveElementIdState
} from './utils/persistence.js';
import {
    describeAspectRatio
} from './utils/resolution.js';

function hideSections() {
    // Hide default sections on start
    let collapsedSectionIds = state.collapsedSectionIds;
    if (isObjectEmpty(collapsedSectionIds)) {
        toggleSection(sectionBracketColors);
        toggleSection(sectionSyntaxColors);
        toggleSection(sectionCanvasColors);
        return;
    }

    // Restore hidden sections
    for (const [id, toggle] of Object.entries(collapsedSectionIds)) {
        if (!toggle) {
            continue;
        }

        baseToggleSection(getElement(id));
    }
}

function init() {
    // Abort any listeners from a previous HMR reload
    window._appListenersController?.abort();
    window._appListenersController = new AbortController();
    const {
        signal
    } = window._appListenersController;

    restoreState();
    hideSections();

    // Focus last selected element before reload
    document.getElementById(state.activeElementId)?.focus();

    // Set resolution badge
    resolutionBadgeElement.textContent = describeAspectRatio();

    // Sections listeners
    document.querySelectorAll(`.${CSS.SECTION_HEADER}`).forEach(
        element => element.addEventListener(EVENTS.CLICK, () => toggleSection(element), {
            signal
        })
    );

    // Buttons listeners
    resetButtonElement.addEventListener(EVENTS.CLICK, () => {
        clearState();
        location.reload();
    }, {
        signal
    });

    // Window reload listener
    window.addEventListener(EVENTS.WINDOW_RELOAD, () => {
        let id = document.activeElement.id;
        for (const element of RELOAD_FOCUS_EXCLUSIONS) {
            if (id === element.id) {
                id = '';
                break;
            }
        }

        state.activeElementId = id;
        saveActiveElementIdState();
    }, {
        signal
    });

    // Initializers
    initColors(signal);
    initThemesSection(signal);
    initTypographySection(signal);
    initEditorSection(signal);
    initCanvas(signal);
    initExport(signal);

    // Show editor content
    state.tokenizer.tokenize(editorElement.value);
    redraw();
}

document.fonts.ready.then(init);