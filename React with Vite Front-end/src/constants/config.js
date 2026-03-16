// src/constants/config.js

export const RISK_CONFIG = {
  LOW: {
    color:  "var(--success)",
    bg:     "var(--success-subtle)",
    border: "rgba(34,197,94,0.2)",
    glow:   "rgba(34,197,94,0.08)",
    label:  "LOW RISK",
    icon:   "✓",
    action: "SAFE TO APPLY",
  },
  MEDIUM: {
    color:  "var(--warning)",
    bg:     "var(--warning-subtle)",
    border: "rgba(245,158,11,0.2)",
    glow:   "rgba(245,158,11,0.08)",
    label:  "MEDIUM RISK",
    icon:   "!",
    action: "PROCEED WITH CAUTION",
  },
  HIGH: {
    color:  "var(--danger)",
    bg:     "var(--danger-subtle)",
    border: "rgba(239,68,68,0.2)",
    glow:   "rgba(239,68,68,0.08)",
    label:  "HIGH RISK",
    icon:   "✕",
    action: "AVOID",
  },
};

export const SCORE_THRESHOLDS = {
  LOW:    { min: 0,  max: 24 },
  MEDIUM: { min: 25, max: 44 },
  HIGH:   { min: 45, max: 100 },
};

export const ENGINE_WEIGHTS = {
  rules:      0.45,
  tensorflow: 0.55,
};

export const SEVERITY_COLOR = {
  HIGH:   "var(--danger)",
  MEDIUM: "var(--warning)",
  LOW:    "var(--text-muted)",
};

export const FLAG_CATEGORIES = [
  "Financial",
  "Identity",
  "Legitimacy",
  "Language",
  "Process",
  "Contact",
];

// Uses CSS variables so it works in both light and dark mode
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