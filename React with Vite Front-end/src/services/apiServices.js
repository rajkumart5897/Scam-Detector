// src/services/apiService.js
// Calls the Flask backend API.
// Replaces tfClassifier.js — same interface, real ML backend.

const BASE_URL = "http://localhost:5000/api";

// ─── Health check ─────────────────────────────────────────────────────────────

export async function checkHealth() {
  try {
    const res  = await fetch(`${BASE_URL}/health`);
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Main analysis ────────────────────────────────────────────────────────────

export async function analyzePosting(text, sessionId) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ text, session_id: sessionId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Analysis failed");
  }
  return await res.json();
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function fetchHistory(limit = 20, offset = 0) {
  const res = await fetch(
    `${BASE_URL}/history?limit=${limit}&offset=${offset}`
  );
  return await res.json();
}

export async function fetchAnalysisById(id) {
  const res = await fetch(`${BASE_URL}/history/${id}`);
  return await res.json();
}

export async function deleteAnalysis(id) {
  const res = await fetch(`${BASE_URL}/history/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export async function fetchMetrics() {
  const res = await fetch(`${BASE_URL}/metrics`);
  return await res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  return await res.json();
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function submitFeedback(analysisId, verdict, actualLabel) {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      analysis_id:  analysisId,
      verdict,
      actual_label: actualLabel,
    }),
  });
  return await res.json();
}