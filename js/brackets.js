// IL = inline
// ML = multi-line

// IL_OPEN = color at current line-depth, then line-depth++
// IL_CLOSE= line-depth--, then color at new line-depth

// ML_OPEN = color at current col-depth, then col-depth++
// ML_CLOSE= col-depth--, then color at new col-depth
// ML_PASS = no depth change; color = (col-depth - 1)

export let BRACKETS = {
    IL_OPEN: ['(', '[', '{'],
    IL_CLOSE: [')', ']', '}'],
    ML_OPEN: ['/', '▏', '┌'],
    ML_CLOSE: ['\\', '▕', '┘'],
    ML_PASS: ['│', '┐', '└'],
};