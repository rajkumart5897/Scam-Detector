// src/constants/config.js

// ─── Risk Level Definitions ───────────────────────────────────────────────────
// These drive the UI colors, labels, and glow effects throughout the app.
// Score 0-100 where 100 = definite scam.

export const RISK_CONFIG = {
  LOW: {
    color:  "#22c55e",
    bg:     "#052010",
    border: "#0a4020",
    glow:   "rgba(34, 197, 94, 0.15)",
    label:  "LOW RISK",
    icon:   "✓",
    action: "SAFE TO APPLY",
  },
  MEDIUM: {
    color:  "#f59e0b",
    bg:     "#1a0f00",
    border: "#3d2200",
    glow:   "rgba(245, 158, 11, 0.15)",
    label:  "MEDIUM RISK",
    icon:   "!",
    action: "PROCEED WITH CAUTION",
  },
  HIGH: {
    color:  "#ef4444",
    bg:     "#1a0505",
    border: "#3d0f0f",
    glow:   "rgba(239, 68, 68, 0.15)",
    label:  "HIGH RISK",
    icon:   "✕",
    action: "AVOID",
  },
};

// ─── Score → Risk Level thresholds ───────────────────────────────────────────
// Combined score (rules + TF.js) maps to a risk level using these cutoffs.

export const SCORE_THRESHOLDS = {
  LOW:    { min: 0,  max: 24 },
  MEDIUM: { min: 25, max: 44 },
  HIGH:   { min: 45, max: 100 },
};

// ─── Engine Weights ───────────────────────────────────────────────────────────
// How much each engine contributes to the final combined score.
// Must add up to 1.0

export const ENGINE_WEIGHTS = {
  rules:      0.55,   // rule-based engine (explainable, high precision)
  tensorflow: 0.45,   // TensorFlow.js classifier (learns patterns)
};

// ─── Severity Colors ─────────────────────────────────────────────────────────
// Used by red flag cards across EvidenceTab and ReportTab.

export const SEVERITY_COLOR = {
  HIGH:   "#ef4444",
  MEDIUM: "#f59e0b",
  LOW:    "#94a3b8",
};

// ─── Flag Categories ─────────────────────────────────────────────────────────
// Every red flag belongs to one of these categories.
// Used in MetricsTab for the category breakdown chart.

export const FLAG_CATEGORIES = [
  "Financial",
  "Identity",
  "Legitimacy",
  "Language",
  "Process",
  "Contact",
];

// ─── UI Theme ─────────────────────────────────────────────────────────────────
// Global design tokens used across all components.

export const THEME = {
  bg:          "#080b0f",
  surface:     "#0c1017",
  surfaceAlt:  "#111820",
  border:      "#1e2d3d",
  borderLight: "#141e28",
  textPrimary: "#e8f0f8",
  textMuted:   "#8ba0b8",
  textDim:     "#4a6070",
  textFaint:   "#243040",
  accent:      "#3b82f6",
};

// ─── Helper: score → risk level ──────────────────────────────────────────────
// Call this anywhere you need to convert a numeric score to LOW/MEDIUM/HIGH.

export function getRiskLevel(score) {
  if (score >= SCORE_THRESHOLDS.HIGH.min)   return "HIGH";
  if (score >= SCORE_THRESHOLDS.MEDIUM.min) return "MEDIUM";
  return "LOW";
}