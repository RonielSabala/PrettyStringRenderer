// ML : multi-line: depth persists column-by-column across rows.
// IL = inline: depth resets to 0 at the start of each row.

// ML_OPEN  → color at current col-depth, then col-depth++
// ML_CLOSE → col-depth--, then color at new col-depth
// ML_PASS  → no depth change; color = (col-depth - 1)
//             (sits "inside" the opener above it)
// IL_OPEN  → color at current line-depth, then line-depth++
// IL_CLOSE → line-depth--, then color at new line-depth

export let BRACKETS = {
    ML_OPEN: ['/', '▏', '┌'],
    ML_CLOSE: ['\\', '▕', '┘'],
    ML_PASS: ['│', '┐', '└'],
    IL_OPEN: ['(', '[', '{'],
    IL_CLOSE: [')', ']', '}'],
};