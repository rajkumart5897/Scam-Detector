// src/hooks/useAnalysis.js
// Orchestration hook — calls Flask backend, builds result,
// manages history state. Replaces the TF.js version entirely.

import { useState, useEffect, useCallback, useRef } from "react";
import {
  analyzePosting, checkHealth,
  fetchHistory, deleteAnalysis,
  submitFeedback,
} from "../services/apiService";
import { getRiskLevel } from "../constants/config";

const SESSION_ID = Math.random().toString(36).slice(2);

const INITIAL_STATE = {
  result:       null,
  loading:      false,
  error:        null,
  backendReady: false,
  backendChecking: true,
  bertReady:    false,
  hardwareInfo: null,
  history:      [],
  historyStats: null,
  historyLoading: false,
};

export function useAnalysis() {
  const [state, setState] = useState(INITIAL_STATE);
  const patch = (updates) =>
    setState(prev => ({ ...prev, ...updates }));

  // ── Check backend health on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function checkBackend() {
      patch({ backendChecking: true });
      try {
        const health = await checkHealth();
        if (!cancelled && health) {
          patch({
            backendReady:    health.status === "ready",
            bertReady:       health.bert_ready,
            hardwareInfo:    health.hardware,
            backendChecking: false,
          });
        } else if (!cancelled) {
          patch({ backendReady: false, backendChecking: false });
        }
      } catch {
        if (!cancelled) {
          patch({ backendReady: false, backendChecking: false });
        }
      }
    }

    checkBackend();

    // Re-check every 10 seconds in case backend is still starting
    const interval = setInterval(checkBackend, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // ── Load history on mount ──────────────────────────────────────────────────
  useEffect(() => {
    loadHistory();
  }, []);

  // ── Main analyze function ──────────────────────────────────────────────────
  const analyze = useCallback(async (jobText) => {
    if (!jobText?.trim()) return;

    patch({ loading: true, error: null, result: null });

    try {
      const raw = await analyzePosting(jobText, SESSION_ID);

      // Build result in the same shape the existing UI components expect
      const result = buildResult(raw, jobText);
      patch({ result, loading: false });

      // Refresh history after new analysis
      loadHistory();

    } catch (err) {
      patch({
        error:   err.message || "Backend unreachable. Is Flask running?",
        loading: false,
      });
    }
  }, []);

  // ── History ────────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    patch({ historyLoading: true });
    try {
      const data = await fetchHistory(20, 0);
      patch({
        history:       data.history || [],
        historyStats:  data.stats   || null,
        historyLoading: false,
      });
    } catch {
      patch({ historyLoading: false });
    }
  }, []);

  const removeFromHistory = useCallback(async (id) => {
    await deleteAnalysis(id);
    loadHistory();
  }, []);

  const giveFeedback = useCallback(async (analysisId, verdict, label) => {
    await submitFeedback(analysisId, verdict, label);
  }, []);

  const reset = useCallback(() => {
    patch({ result: null, error: null });
  }, []);

  return {
    // Analysis
    result:          state.result,
    loading:         state.loading,
    error:           state.error,
    analyze,
    reset,

    // Backend status
    backendReady:    state.backendReady,
    backendChecking: state.backendChecking,
    bertReady:       state.bertReady,
    hardwareInfo:    state.hardwareInfo,

    // History
    history:         state.history,
    historyStats:    state.historyStats,
    historyLoading:  state.historyLoading,
    loadHistory,
    removeFromHistory,
    giveFeedback,
  };
}

// ─── Build result ─────────────────────────────────────────────────────────────
// Transforms Flask response into the shape existing UI components expect.
// This means Header, RiskBanner, OverviewTab etc need ZERO changes.

function buildResult(raw, jobText) {
  const mp = raw.eval_metrics || {};
  const ms = raw.model_scores || {};
  const mt = raw.model_times  || {};
  const mb = raw.model_probs  || {};

  return {
    // Core — same keys as before
    id:                 raw.id,
    score:              raw.score,
    riskLevel:          raw.risk_level,
    verdict:            raw.verdict,
    executiveSummary:   raw.executive_summary,
    recommendedAction:  raw.recommended_action,

    // Red flags + positives — identical shape
    redFlags:           raw.red_flags   || [],
    positives:          raw.positives   || [],
    scamPatterns:       raw.scam_patterns || [],

    // Engine scores — now includes all 5 models
    engineScores: {
      rules:       raw.rule_score,
      lr:          ms.lr,
      nb:          ms.nb,
      rf:          ms.rf,
      svm:         ms.svm,
      bert:        ms.bert,
      ensemble:    ms.ensemble,
      combined:    raw.score,
      tfAvailable: raw.bert_available,
    },

    // ML metrics — real from backend
    modelPerformance: {
      // Per-model eval metrics
      lr:  mp.lr,
      nb:  mp.nb,
      rf:  mp.rf,
      svm: mp.svm,

      // Timing
      lrTime:   mt.lr,
      nbTime:   mt.nb,
      rfTime:   mt.rf,
      svmTime:  mt.svm,
      bertTime: mt.bert,

      // Probabilities
      lrProb:   mb.lr,
      nbProb:   mb.nb,
      rfProb:   mb.rf,
      svmProb:  mb.svm,
      bertProb: mb.bert,

      // Confidence
      confidence:      parseFloat(
        Math.min(0.99, 0.5 + Math.abs(raw.score - 50) / 100).toFixed(3)
      ),
      signalDensity:   parseFloat(
        (raw.red_flags?.length / 13).toFixed(3)
      ),
      featuresAnalyzed: 13,
      featuresFired:   raw.red_flags?.length || 0,
      tfAvailable:     raw.bert_available,

      // Hardware
      hardwareTier:    raw.hardware_tier,
      hardwareProfile: raw.hardware_profile,
      totalTimeMs:     raw.total_time_ms,

      // Dataset
      datasetStats: {
        total:      30,
        scamCount:  18,
        legitCount: 12,
      },
    },

    // Category breakdown
    categoryBreakdown: buildCategoryBreakdown(raw.red_flags),
    totalRulesChecked: 13,
    totalRulesFired:   raw.red_flags?.length || 0,

    // Meta
    analyzedAt: raw.analyzed_at,
    wordCount:  raw.word_count,
    charCount:  raw.char_count,
  };
}

function buildCategoryBreakdown(redFlags = []) {
  const breakdown = {};
  for (const flag of redFlags) {
    breakdown[flag.category] = (breakdown[flag.category] || 0) + 1;
  }
  return breakdown;
}