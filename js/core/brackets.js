// IL = inline
// ML = multi-line
const BRACKETS = {
    IL_OPEN: ['(', '[', '{'],
    IL_CLOSE: [')', ']', '}'],
    ML_OPEN: ['/', '▏', '┌'],
    ML_CLOSE: ['\\', '▕', '┘'],
    ML_PASS: ['│', '┐', '└'],
};

const BRACKET_GROUPS = {
    mlopen: {
        arr: () => BRACKETS.ML_OPEN,
        set: value => {
            BRACKETS.ML_OPEN = value;
        }
    },
    mlclose: {
        arr: () => BRACKETS.ML_CLOSE,
        set: value => {
            BRACKETS.ML_CLOSE = value;
        }
    },
    mlpass: {
        arr: () => BRACKETS.ML_PASS,
        set: value => {
            BRACKETS.ML_PASS = value;
        }
    },
    ilopen: {
        arr: () => BRACKETS.IL_OPEN,
        set: value => {
            BRACKETS.IL_OPEN = value;
        }
    },
    ilclose: {
        arr: () => BRACKETS.IL_CLOSE,
        set: value => {
            BRACKETS.IL_CLOSE = value;
        }
    },
};

const BRACKET_SETS = {
    open: new Set(BRACKETS.ML_OPEN),
    close: new Set(BRACKETS.ML_CLOSE),
    pass: new Set(BRACKETS.ML_PASS),
    ilO: new Set(BRACKETS.IL_OPEN),
    ilC: new Set(BRACKETS.IL_CLOSE),
};

export {
    BRACKET_GROUPS,
    BRACKET_SETS,
    BRACKETS
};