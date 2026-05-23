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
    "Hold [Alt] + [Scroll] to zoom in and out.",
    "Hold [Space] + Drag to pan across the canvas.",
    "Mix different brackets to cycle through your palette.",
    "Multiline arms automatically stretch to wrap tall logic.",
    "Wrap logic in [ ] or ( ) to see automatic color shifting.",
  ],
  specificTips: [
    "Cut comments in half with \\ {var} # to highlight your art.",
    "Use \\ {var} # as a building block for deeply nested equations.",
    "Try wrapping \\ {var} # in a new bracket family.",
    "Isolate \\ {var} # to see syntax colors.",
  ],
  formulas: [
    {
      variable: "f(x)",
      artLines: ["f(x) = sin(x)"],
    },
    {
      variable: "f(x)",
      artLines: [
        "               x",
        "f(x) = ──────────────────",
        "          2         2",
        "       cos (x) + sin (x)",
      ],
    },
    {
      variable: "M",
      artLines: [
        "    ┌               ┐   ┌   ┐",
        "    │ ┌           ┐ │   │ x │",
        "    │ │  1  0  0  │ │   │   │",
        "M = │ │  0  1  0  │ │ * │ y │",
        "    │ │  0  0  1  │ │   │   │",
        "    │ └           ┘ │   │ z │",
        "    └               ┘   └   ┘",
      ],
    },
    {
      variable: "y",
      artLines: [
        "    ┌                       ┐",
        "    │  /                 \\  │",
        "    │  ▏        1        ▕  │",
        "y = │  ▏ ─────────────── ▕  │",
        "    │  ▏  √( 2π * σ^2 )  ▕  │",
        "    │  \\                 /  │",
        "    └                       ┘",
      ],
    },
    {
      variable: "φ",
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
      variable: "ζ(s)",
      artLines: [
        "        s    s — 1       / πs \\",
        "ζ(s) = 2  · π      · sin ▏ ── ▕ Γ(1 — s) ζ(1 — s)",
        "                         \\  2 /",
      ],
    },
  ],
} as const;
