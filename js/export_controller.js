import {
    config
} from "./config.js";

function _doExport() {
    const mul = parseFloat(
        prompt('Scale multiplier:\n  1  → 3120x780\n  2  → 6240x1560\n  0.5 → 1560x390', '1')
    );
    if (isNaN(mul) || mul <= 0) return;

    const W = Math.round(OUT_WIDTH * mul),
        H = Math.round(OUT_HEIGHT * mul);
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;

    // Scale config measurements for the off-screen canvas
    const s = {
        fs: config.fontSize,
        ls: config.letterSpacing,
        px: config.canvasPadX,
        py: config.canvasPadY
    };
    config.fontSize *= mul;
    config.letterSpacing *= mul;
    config.canvasPadX *= mul;
    config.canvasPadY *= mul;
    render(off.getContext('2d'), tokenLines, W, H);
    config.fontSize = s.fs;
    config.letterSpacing = s.ls;
    config.canvasPadX = s.px;
    config.canvasPadY = s.py;

    off.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `code-art-${W}x${H}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
    }, 'image/png');
}

function _exportCurrentTheme() {
    const name = prompt('Theme name:', activeThemeName || 'my-theme');
    if (!name) {
        return;
    }

    colors = config.colors;
    const theme = {
        bracket0: colors.bracket0,
        bracket1: colors.bracket1,
        bracket2: colors.bracket2,
        function: colors.function,
        variable: colors.variable,
        operator: colors.operator,
        semicolon: colors.semicolon,
        number: colors.number,
        comment: colors.comment,
        unknown: colors.unknown,
        background: colors.background,
    };

    const blob = new Blob([JSON.stringify(theme, null, 2)], {
        type: 'application/json'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = name.endsWith('.json') ? name : name + '.json';
    anchor.click();

    URL.revokeObjectURL(anchor.href);
}

export {
    _doExport,
    _exportCurrentTheme
};