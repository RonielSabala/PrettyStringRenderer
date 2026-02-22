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
        set: v => {
            BRACKETS.ML_OPEN = v;
        }
    },
    mlclose: {
        arr: () => BRACKETS.ML_CLOSE,
        set: v => {
            BRACKETS.ML_CLOSE = v;
        }
    },
    mlpass: {
        arr: () => BRACKETS.ML_PASS,
        set: v => {
            BRACKETS.ML_PASS = v;
        }
    },
    ilopen: {
        arr: () => BRACKETS.IL_OPEN,
        set: v => {
            BRACKETS.IL_OPEN = v;
        }
    },
    ilclose: {
        arr: () => BRACKETS.IL_CLOSE,
        set: v => {
            BRACKETS.IL_CLOSE = v;
        }
    },
};

export {
    BRACKET_GROUPS,
    BRACKETS
};