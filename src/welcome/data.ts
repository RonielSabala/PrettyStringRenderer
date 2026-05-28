export const WELCOME_DATA = {
  headings: [
    "Canvas initialized.",
    "Your canvas is ready.",
    "Engine loaded successfully.",
    "Welcome to the layout engine.",
    "A blank slate for complex logic.",
  ],
  subtitles: [
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
    "Cut comments in half with \\ {subject} # to highlight your art.",
    "Use \\ {subject} # as a building block for deeply nested equations.",
    "Try wrapping \\ {subject} # in a new bracket family.",
    "Isolate \\ {subject} # to see syntax colors.",
  ],
  formulas: [
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
      subject: "x",
      artLines: ["   2         2", "sin (x) + cos (x) = 1"],
    },
    {
      subject: "θ",
      artLines: ["             2         2", "cos(2θ) = cos (θ) — sin (θ)"],
    },
    {
      subject: "x",
      artLines: [" ix", "e   = cos(x) + i * sin(x)"],
    },
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
    {
      subject: "φ",
      artLines: [
        "    /         1          \\",
        "    ▏ ────────────────── ▕",
        "    ▏            1       ▕",
        "φ = ▏  1 + ───────────── ▕",
        "    ▏              1     ▕",
        "    ▏       1 + ──────── ▕",
        "    \\            1 + ... /",
      ],
    },
    {
      subject: "ζ(s)",
      artLines: [
        "        s    s — 1       / πs \\",
        "ζ(s) = 2  · π      · sin ▏ ── ▕ Γ(1 — s) ζ(1 — s)",
        "                         \\  2 /",
      ],
    },
  ],
} as const;
