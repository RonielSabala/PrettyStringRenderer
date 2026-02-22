import {
    getBracketChipColor,
    resolveColor
} from "../common/color_utils.js";
import {
    ASPECT_RATIO,
    config,
    OUT_HEIGHT,
    OUT_WIDTH
} from "../common/config.js";
import {
    BRACKET_GROUPS
} from "../core/brackets.js";
import {
    tokenize
} from "../core/tokenizer.js";
import {
    updateZoomInfo
} from "./canvas_controller.js";

let tokenLines = [];

function _getFont(fontSize) {
    return `400 ${fontSize}px 'Cascadia Code'`;
}

function render(context, lines, W, H) {
    context.fillStyle = config.colors.background;
    context.fillRect(0, 0, W, H);
    context.font = _getFont(config.fontSize);
    context.textBaseline = 'alphabetic';

    const cw = context.measureText('M').width + config.letterSpacing;
    const lhpx = config.fontSize * config.lineHeight;
    const x0 = config.canvasPadX;
    const y0 = config.canvasPadY + config.fontSize * 0.82;

    for (let row = 0; row < lines.length; row++) {
        let col = 0;
        const cy = y0 + row * lhpx;
        for (const token of lines[row]) {
            const tokenColor = resolveColor(token);
            if (!tokenColor) {
                col += token.v.length;
                continue;
            }

            context.fillStyle = tokenColor;
            for (let c = 0; c < token.v.length; c++) {
                context.fillText(token.v[c], x0 + (col + c) * cw, cy);
            }

            col += token.v.length;
        }
    }
}

function redraw() {
    tokenLines = tokenize(document.getElementById('ed').value);

    const canvas = document.getElementById('canvas');
    const wrap = document.getElementById('cv-wrap');

    // Canvas always at full output resolution
    canvas.width = OUT_WIDTH;
    canvas.height = OUT_HEIGHT;

    render(canvas.getContext('2d'), tokenLines, OUT_WIDTH, OUT_HEIGHT);

    // CSS display size fits wrap, preserving aspect ratio
    const wW = wrap.clientWidth - 40;
    const wH = wrap.clientHeight - 40;
    let dW = Math.min(wW, wH * ASPECT_RATIO);
    let dH = dW / ASPECT_RATIO;
    if (dH > wH) {
        dH = wH;
        dW = dH * ASPECT_RATIO;
    }
    canvas.style.width = Math.max(1, Math.round(dW)) + 'px';
    canvas.style.height = Math.max(1, Math.round(dH)) + 'px';

    updateZoomInfo();
}

function renderOpChips() {
    const container = document.getElementById('op-chips');
    const opColor = config.colors.operator;
    container.innerHTML = '';

    for (const op of config.operators) {
        const chip = document.createElement('span');
        chip.className = 'chip';

        const code = document.createElement('code');
        code.textContent = op;
        code.style.color = opColor;

        const del = document.createElement('button');
        del.className = 'chip-x';
        del.textContent = 'x';
        del.title = 'Remove';
        del.onclick = () => _removeOp(op);

        chip.append(code, del);
        container.appendChild(chip);
    }
}

function renderBracketChips() {
    for (const [gid, g] of Object.entries(BRACKET_GROUPS)) {
        const container = document.getElementById(`chips-${gid}`);
        container.innerHTML = '';

        g.arr().forEach((ch, idx) => {
            const chip = document.createElement('span');
            chip.className = 'chip';

            const code = document.createElement('code');
            code.textContent = ch;
            code.style.color = getBracketChipColor(idx);

            const del = document.createElement('button');
            del.className = 'chip-x';
            del.textContent = 'x';
            del.title = 'Remove';
            del.onclick = () => _removeBracket(gid, ch);

            chip.append(code, del);
            container.appendChild(chip);
        });
    }
}

function updateColor(key, value) {
    const fill = document.getElementById(`sf-${key}`);
    if (fill) {
        fill.style.background = value;
    }

    const pick = document.getElementById(`cp-${key}`);
    if (pick) {
        pick.value = value;
    }

    const hex = document.getElementById(`hx-${key}`);
    if (hex) {
        hex.value = value;
    }
}

function setColor(key, value) {
    updateColor(key, value);

    if (key === 'background') {
        config.colors.background = value;
    } else {
        config.colors[key] = value;
        if (key === 'operator') {
            renderOpChips();
        }
    }

    redraw();
}

function addOp() {
    const input = document.getElementById('new-op');
    const value = input.value;

    if (value && !config.operators.includes(value)) {
        config.operators.push(value);
        renderOpChips();
        redraw();
    }

    input.value = '';
    input.focus();
}

function addBracket(groupId) {
    const input = document.getElementById(`add-${groupId}`);
    const value = input.value.trim();
    if (!value) {
        return;
    }

    const group = BRACKET_GROUPS[groupId];
    if (!group.arr().includes(value)) {
        const next = [...group.arr(), value];
        group.set(next);

        renderBracketChips();
        redraw();
    }

    input.value = '';
    input.focus();
}

function _removeOp(op) {
    config.operators = config.operators.filter(operator => operator !== op);
    renderOpChips();
    redraw();
}

function _removeBracket(gid, ch) {
    const g = BRACKET_GROUPS[gid];
    const next = g.arr().filter(c => c !== ch);

    g.set(next);
    renderBracketChips();
    redraw();
}

export {
    addBracket,
    addOp,
    redraw,
    render,
    renderBracketChips,
    renderOpChips,
    setColor,
    tokenLines,
    updateColor
};