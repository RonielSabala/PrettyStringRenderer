export const WELCOME_DATA = {
  headings: [
    "Renderer active.",
    "Tokenizer ready.",
    "Canvas initialized.",
    "Environment loaded.",
    "Workspace prepared.",
    "Layout engine ready.",
    "Your canvas is ready.",
    "Initialization complete.",
    "Engine loaded successfully.",
  ],
  subtitles: [
    "Start building.",
    "Build your next layout.",
    "Craft beautiful equations.",
    "Shape your data with precision.",
    "Forge dynamic layouts instantly.",
    "Design complex structures easily.",
    "Input or edit formulas to begin creating.",
    "Type your equations to see them transform.",
    "Build complex structures to see them scale.",
    "Render beautiful math directly from plain text.",
    "Mix brackets, operators, and variables with ease.",
  ],
  genericTips: [
    "[Scroll] to pan vertically across the canvas.",
    "Hold {{canvas.panHold}} + [Drag] to pan across the canvas.",
    "Hold {{canvas.panXModifier}} + [Scroll] to pan horizontally across the canvas.",
    "Hold {{canvas.zoomModifier}} + [Scroll] to zoom.",
    "Ready to share? Press {{workspace.export}} to export your masterpiece.",
    "Want a clean slate? Press {{app.fullReload}} for a full workspace reset.",
    "Need more workspace? [Double-Click] the editor's resize handle to minimize it.",
    "Lost your equation on screen? [Double-Click] the canvas to reset your view.",
  ],
  specificTips: [
    "Try wrapping \\ {subject} # in a new bracket family.",
    "Isolate \\ {subject} # to see the tokenizer apply colors.",
    "Use \\ {subject} # as a building block for deeply nested equations.",
    "Use \\ {subject} # as the starting point to build a massive continued fraction.",
    "Type multiple instances of \\ {subject} # on new lines to test rendering speed.",
    "Place \\ {subject} # at the edge of the canvas to test the token clipping range.",
    "Delete and re-type \\ {subject} # to see the performant canvas redraw in action.",
  ],
  formulas: [
    // Constants
    {
      subject: "π",
      artLines: [
        "     2   2   4   4   6   6",
        "π =  ─ · ─ · ─ · ─ · ─ · ─ · ...",
        "     1   3   3   5   5   7",
      ],
    },
    {
      subject: "e",
      artLines: [
        "         1     1     1     1",
        "e = 1 + ─── + ─── + ─── + ─── + ...",
        "         1!    2!    3!    4!",
      ],
    },
    {
      subject: "φ",
      artLines: [
        "            1         ",
        "φ = ──────────────────",
        "               1      ",
        "     1 + ─────────────",
        "                 1    ",
        "          1 + ────────",
        "               1 + ...",
      ],
    },
    // Trigonometry
    {
      subject: "sin(x)",
      artLines: [
        "               3     5     7",
        "              x     x     x",
        "sin(x) = x — ─── + ─── — ─── + ...",
        "              3!    5!    7!",
      ],
    },
    {
      subject: "cos(x)",
      artLines: [
        "               2     4     6",
        "              x     x     x",
        "cos(x) = 1 — ─── + ─── — ─── + ...",
        "              2!    4!    6!",
      ],
    },
    {
      subject: "cos(2θ)",
      artLines: ["             2         2", "cos(2θ) = cos (θ) — sin (θ)"],
    },
    {
      subject: "x",
      artLines: ["   2         2", "sin (x) + cos (x) = 1"],
    },
    {
      subject: "x",
      artLines: [" ix", "e   = cos(x) + i * sin(x)"],
    },
    // Functions
    {
      subject: "ζ(s)",
      artLines: [
        "        s    s — 1       / πs \\",
        "ζ(s) = 2  · π      · sin ▏ ── ▕ Γ(1 — s) ζ(1 — s)",
        "                         \\  2 /",
      ],
    },
    {
      subject: "Γ(z)",
      artLines: [
        "                  π",
        "Γ(z)Γ(1 — z) = ───────",
        "               sin(πz)",
      ],
    },
    // Miscellanea
    {
      subject: "M",
      artLines: [
        "    ┌         ┐   ┌   ┐",
        "    │ 1  0  0 │   │ x │",
        "M = │ 0  1  0 │ * │ y │",
        "    │ 0  0  1 │   │ z │",
        "    └         ┘   └   ┘",
      ],
    },
  ],
} as const;
