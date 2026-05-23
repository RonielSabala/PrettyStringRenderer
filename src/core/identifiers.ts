const _GREEK_LOWERCASE = [
  "α",
  "β",
  "γ",
  "δ",
  "ε",
  "ζ",
  "η",
  "θ",
  "ι",
  "κ",
  "λ",
  "μ",
  "ν",
  "ξ",
  "ο",
  "π",
  "ρ",
  "σ",
  "τ",
  "υ",
  "φ",
  "χ",
  "ψ",
  "ω",
];
const _GREEK_UPPERCASE = ["Γ", "Δ", "Θ", "Λ", "Ξ", "Π", "Σ", "Φ", "Ψ", "Ω"];
const _SPECIAL_CONSTANTS = ["∞", "∂", "∇", "ℵ"];

export const IDENTIFIER_SYMBOLS_SET = Object.freeze(
  new Set([..._GREEK_LOWERCASE, ..._GREEK_UPPERCASE, ..._SPECIAL_CONSTANTS]),
);
