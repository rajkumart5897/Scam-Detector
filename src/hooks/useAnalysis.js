// src/hooks/useAnalysis.js
// Custom React hook that orchestrates the rule engine and
// TensorFlow.js classifier, combines their outputs, and
// exposes a single clean interface to all components.

import { useState, useEffect, useCallback } from "react";
import { runRuleEngine }                    from "../services/ruleEngine";
import { initClassifier, predict, isClassifierReady } from "../services/tfClassifier";
import { ENGINE_WEIGHTS, getRiskLevel }     from "../constants/config";

// ─── Initial state shape ──────────────────────────────────────────────────────
// Defined once here so we can reset to it cleanly.

const INITIAL_STATE = {
  result:       null,    // full analysis result object
  loading:      false,   // analysis in progress
  error:        null,    // error message string or null
  tfReady:      false,   // has TF.js finished training?
  tfTraining:   false,   // is TF.js currently training?
  modelMetrics: null,    // precision, recall, F1 from training
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalysis() {
  const [state, setState] = useState(INITIAL_STATE);

  // Helper to patch a subset of state without wiping the rest
  const patch = (updates) =>
    setState(prev => ({ ...prev, ...updates }));

  // ── Boot TensorFlow.js on mount ─────────────────────────────────────────────
  // We start training immediately when the hook first mounts so the
  // model is ready by the time the user pastes their first posting.

  useEffect(() => {
    let cancelled = false;

    async function bootClassifier() {
      if (isClassifierReady()) {
        patch({ tfReady: true });
        return;
      }

      patch({ tfTraining: true });

      try {
        const metrics = await initClassifier();
        if (!cancelled) {
          patch({
            tfReady:      true,
            tfTraining:   false,
            modelMetrics: metrics,
          });
        }
      } catch (err) {
        console.error("TF.js training failed:", err);
        if (!cancelled) {
          // TF failure is non-fatal — rule engine still works alone
          patch({ tfReady: false, tfTraining: false });
        }
      }
    }

    bootClassifier();

    // Cleanup flag prevents state updates on unmounted component
    return () => { cancelled = true; };
  }, []);

  // ── Main analysis function ──────────────────────────────────────────────────
  // Wrapped in useCallback so components can safely put it in
  // dependency arrays without triggering infinite re-renders.

  const analyze = useCallback(async (jobText) => {
    if (!jobText || !jobText.trim()) return;

    patch({ loading: true, error: null, result: null });

    try {
      // ── Step 1: Rule Engine (synchronous, instant) ────────────────────────
      const ruleResult = runRuleEngine(jobText);

      // ── Step 2: TensorFlow.js (async, ~50ms after training) ───────────────
      let tfScore      = 0;
      let tfAvailable  = false;

      if (state.tfReady || isClassifierReady()) {
        try {
          const prob   = await predict(jobText);
          tfScore      = Math.round(prob * 100);   // 0-100
          tfAvailable  = true;
        } catch (tfErr) {
          console.warn("TF prediction failed, using rules only:", tfErr);
        }
      }

      // ── Step 3: Combine scores ────────────────────────────────────────────
      // If TF is available: weighted average of both engines
      // If TF failed:       fall back to rules-only score
      const combinedScore = tfAvailable
        ? Math.round(
            ruleResult.normalizedScore * ENGINE_WEIGHTS.rules +
            tfScore                    * ENGINE_WEIGHTS.tensorflow
          )
        : ruleResult.normalizedScore;

      // Clamp to 0-100
      const finalScore = Math.max(0, Math.min(100, combinedScore));

      // ── Step 4: Derive risk level and summary ─────────────────────────────
      const riskLevel = getRiskLevel(finalScore);

      // ── Step 5: Build full result object ─────────────────────────────────
      const result = buildResult({
        jobText,
        finalScore,
        riskLevel,
        ruleResult,
        tfScore,
        tfAvailable,
        modelMetrics: state.modelMetrics,
      });

      patch({ result, loading: false });

    } catch (err) {
      console.error("Analysis error:", err);
      patch({
        error:   "Analysis failed. Please try again.",
        loading: false,
      });
    }
  }, [state.tfReady, state.modelMetrics]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    patch({ result: null, error: null });
  }, []);

  return {
    // State
    result:       state.result,
    loading:      state.loading,
    error:        state.error,
    tfReady:      state.tfReady,
    tfTraining:   state.tfTraining,
    modelMetrics: state.modelMetrics,

    // Actions
    analyze,
    reset,
  };
}

// ─── Result Builder ───────────────────────────────────────────────────────────
// Assembles the final result object that every tab component reads from.
// Keeping this outside the hook makes it easy to unit test independently.

function buildResult({
  jobText,
  finalScore,
  riskLevel,
  ruleResult,
  tfScore,
  tfAvailable,
  modelMetrics,
}) {
  // ── Executive summary ──────────────────────────────────────────────────────
  const summary = buildSummary(finalScore, riskLevel, ruleResult);

  // ── Recommended action ─────────────────────────────────────────────────────
  const actionMap = {
    HIGH:   "AVOID",
    MEDIUM: "PROCEED WITH CAUTION",
    LOW:    "SAFE TO APPLY",
  };

  // ── Similar scam patterns ──────────────────────────────────────────────────
  const scamPatterns = deriveScamPatterns(ruleResult.redFlags);

  // ── Model performance block ────────────────────────────────────────────────
  // Combines live TF.js training metrics with per-prediction confidence.
  const modelPerformance = buildModelPerformance({
    finalScore,
    tfScore,
    tfAvailable,
    modelMetrics,
    ruleResult,
  });

  return {
    // Core
    score:              finalScore,
    riskLevel,
    verdict:            buildVerdict(finalScore, riskLevel, ruleResult),
    executiveSummary:   summary,
    recommendedAction:  actionMap[riskLevel],

    // Red flags and positives (from rule engine)
    redFlags:           ruleResult.redFlags,
    positives:          ruleResult.positives,

    // Engine breakdown
    engineScores: {
      rules:       ruleResult.normalizedScore,
      tensorflow:  tfAvailable ? tfScore : null,
      combined:    finalScore,
      tfAvailable,
    },

    // ML metrics for MetricsTab
    modelPerformance,

    // Report metadata
    scamPatterns,
    categoryBreakdown:  ruleResult.categoryBreakdown,
    totalRulesChecked:  ruleResult.totalRulesChecked,
    totalRulesFired:    ruleResult.totalRulesFired,
    analyzedAt:         new Date().toISOString(),
    wordCount:          jobText.trim().split(/\s+/).filter(Boolean).length,
    charCount:          jobText.trim().length,
  };
}

// ─── Summary builder ──────────────────────────────────────────────────────────

function buildSummary(score, riskLevel, ruleResult) {
  const flagCount    = ruleResult.redFlags.length;
  const highCount    = ruleResult.redFlags.filter(f => f.severity === "HIGH").length;
  const topCategory  = getTopCategory(ruleResult.categoryBreakdown);

  if (riskLevel === "HIGH") {
    return (
      `This posting exhibits ${flagCount} distinct fraud indicators, including ` +
      `${highCount} high-severity signal${highCount !== 1 ? "s" : ""} concentrated in the ` +
      `${topCategory} category. The combined ML and rule-based analysis assigns a scam ` +
      `probability score of ${score}/100, placing this firmly in the high-risk tier. ` +
      `Applicants are strongly advised to avoid engaging with this posting, refrain from ` +
      `sharing any personal information, and report it to the relevant job platform.`
    );
  }

  if (riskLevel === "MEDIUM") {
    return (
      `This posting contains ${flagCount} cautionary signal${flagCount !== 1 ? "s" : ""} that ` +
      `warrant further verification before proceeding. The ${topCategory} category shows the ` +
      `highest concentration of anomalies. A scam probability score of ${score}/100 suggests ` +
      `moderate risk — the posting may be legitimate but lacks the transparency and verifiable ` +
      `details expected of professional employers. Independent verification of the company ` +
      `and role is strongly recommended before submitting any application.`
    );
  }

  return (
    `This posting demonstrates ${ruleResult.positives.length} positive legitimacy signal${ruleResult.positives.length !== 1 ? "s" : ""} ` +
    `and scored ${score}/100 on the scam probability scale, indicating a low fraud risk. ` +
    `${flagCount > 0 ? `${flagCount} minor flag${flagCount !== 1 ? "s" : ""} were noted but do not significantly elevate concern.` : "No significant red flags were detected."} ` +
    `Standard due diligence — researching the company independently and verifying the role ` +
    `through official channels — is always recommended before applying.`
  );
}

// ─── Verdict (one sentence) ───────────────────────────────────────────────────

function buildVerdict(score, riskLevel, ruleResult) {
  const flagCount = ruleResult.redFlags.length;
  const verdicts  = {
    HIGH:   `High fraud probability (${score}/100) — ${flagCount} red flag${flagCount !== 1 ? "s" : ""} detected; do not apply or share personal information.`,
    MEDIUM: `Moderate risk score (${score}/100) — ${flagCount} cautionary signal${flagCount !== 1 ? "s" : ""} detected; verify the employer independently before proceeding.`,
    LOW:    `Low fraud probability (${score}/100) — posting appears consistent with legitimate employment practices.`,
  };
  return verdicts[riskLevel];
}

// ─── Scam pattern classifier ──────────────────────────────────────────────────
// Maps fired rule IDs to known scam taxonomy labels.

function deriveScamPatterns(redFlags) {
  const patternMap = {
    upfront_fee:          "Advance Fee Fraud",
    requests_bank_details:"Money Mule Recruitment",
    requests_personal_info:"Identity Theft Scheme",
    unrealistic_salary:   "Work-From-Home Income Scam",
    no_interview:         "Impersonation / Fake Employer",
    urgency_pressure:     "High-Pressure Recruitment Fraud",
    suspicious_email:     "Phishing via Fake Job Offer",
    too_good_to_be_true:  "Get-Rich-Quick Employment Scam",
  };

  const patterns = new Set();
  for (const flag of redFlags) {
    if (patternMap[flag.id]) {
      patterns.add(patternMap[flag.id]);
    }
  }
  return [...patterns];
}

// ─── Model performance block ──────────────────────────────────────────────────

function buildModelPerformance({
  finalScore, tfScore, tfAvailable, modelMetrics, ruleResult,
}) {
  const signalDensity = ruleResult.totalRulesChecked > 0
    ? parseFloat((ruleResult.totalRulesFired / ruleResult.totalRulesChecked).toFixed(3))
    : 0;

  const confidence = parseFloat(
    Math.min(0.99, 0.5 + (Math.abs(finalScore - 50) / 100)).toFixed(3)
  );

  return {
    // From TF.js training evaluation (real metrics)
    precision:      modelMetrics?.precision       ?? null,
    recall:         modelMetrics?.recall          ?? null,
    f1Score:        modelMetrics?.f1Score         ?? null,
    trainAccuracy:  modelMetrics?.trainAccuracy   ?? null,
    valAccuracy:    modelMetrics?.valAccuracy     ?? null,
    confusionMatrix:modelMetrics?.confusionMatrix ?? null,

    // Per-prediction metrics
    tfScore:         tfAvailable ? tfScore : null,
    ruleScore:       ruleResult.normalizedScore,
    combinedScore:   finalScore,
    confidence,
    signalDensity,
    featuresAnalyzed:ruleResult.totalRulesChecked,
    featuresFired:   ruleResult.totalRulesFired,
    tfAvailable,

    // Dataset info
    datasetStats:    modelMetrics?.datasetStats   ?? null,
    vocabSize:       modelMetrics?.vocabSize       ?? null,
    architecture:    modelMetrics?.architecture   ?? null,
    epochs:          modelMetrics?.epochs         ?? null,
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getTopCategory(breakdown) {
  if (!breakdown || Object.keys(breakdown).length === 0) return "General";
  return Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])[0][0];
}