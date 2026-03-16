// src/constants/config.js

// ─── Theme detection helper ───────────────────────────────────────────────────
// Returns true if currently in light mode
export function isLight() {
  return document.documentElement.getAttribute("data-theme") === "light";
}

// ─── Risk configs — actual hex values, no CSS vars ───────────────────────────
export const RISK_CONFIG = {
  LOW: {
    color:  "#22c55e",
    bg:     "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    glow:   "rgba(34,197,94,0.06)",
    label:  "LOW RISK",
    icon:   "✓",
    action: "SAFE TO APPLY",
  },
  MEDIUM: {
    color:  "#f59e0b",
    bg:     "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    glow:   "rgba(245,158,11,0.06)",
    label:  "MEDIUM RISK",
    icon:   "!",
    action: "PROCEED WITH CAUTION",
  },
  HIGH: {
    color:  "#ef4444",
    bg:     "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    glow:   "rgba(239,68,68,0.06)",
    label:  "HIGH RISK",
    icon:   "✕",
    action: "AVOID",
  },
};

export const SCORE_THRESHOLDS = {
  LOW:    { min: 0,  max: 24  },
  MEDIUM: { min: 25, max: 44  },
  HIGH:   { min: 45, max: 100 },
};

export const ENGINE_WEIGHTS = {
  rules:      0.45,
  tensorflow: 0.55,
};

// Actual hex values — work everywhere including interpolated strings
export const SEVERITY_COLOR = {
  HIGH:   "#ef4444",
  MEDIUM: "#f59e0b",
  LOW:    "#71717a",
};

export const FLAG_CATEGORIES = [
  "Financial",
  "Identity",
  "Legitimacy",
  "Language",
  "Process",
  "Contact",
];

// THEME uses CSS vars for properties that go directly into style={{}}
// These work fine as direct style values (not interpolated)
export const THEME = {
  bg:          "var(--bg)",
  surface:     "var(--bg-elevated)",
  surfaceAlt:  "var(--bg-overlay)",
  border:      "var(--border)",
  borderLight: "var(--border-subtle)",
  textPrimary: "var(--text-primary)",
  textMuted:   "var(--text-secondary)",
  textDim:     "var(--text-muted)",
  textFaint:   "var(--text-faint)",
  accent:      "var(--accent)",
};

export function getRiskLevel(score) {
  if (score >= SCORE_THRESHOLDS.HIGH.min)   return "HIGH";
  if (score >= SCORE_THRESHOLDS.MEDIUM.min) return "MEDIUM";
  return "LOW";
}