// src/components/JobInput.jsx
// The main input area. Handles:
//   - Textarea for pasting job postings
//   - Sample loaders (scam + legit)
//   - Word / char count
//   - Analyze button with loading state
//   - TF.js training status warning

import { useState }      from "react";
import { THEME }         from "../constants/config";

// ─── Sample postings ──────────────────────────────────────────────────────────
const SAMPLES = {
  scam: `Job Title: Work From Home - Earn $5000/week!

We are looking for motivated individuals to join our team as 
Data Entry Specialists. No experience needed! You will be 
processing simple online forms from home.

Requirements:
- Must be 18+
- Access to a computer
- Reliable internet connection

Compensation: $500-$5000 per week depending on performance
Training fee: $49.99 required to get started (refundable after 30 days)

To apply, send your full name, address, date of birth, and bank 
details to jobs@quickcash-online.net

Company: Global Opportunities LLC
No interviews required - immediate start!`,

  legit: `Software Engineer — Frontend (React)
Company: Stripe | Bengaluru, India (Hybrid)

About the Role:
Stripe is looking for a Frontend Engineer to join our 
Dashboard team. You will work on tools that help millions 
of businesses manage their payments.

Responsibilities:
- Build and maintain features using React and TypeScript
- Collaborate with designers and backend engineers
- Participate in code reviews and architecture discussions
- Write tests using Jest and Cypress

Requirements:
- 3+ years React experience
- Strong TypeScript skills
- BS/MS in Computer Science or equivalent

Salary: ₹28–38 LPA + equity + benefits
Apply at: stripe.com/jobs | careers@stripe.com
Interview: Phone screen → Technical assessment → 3 virtual rounds`,
};

export default function JobInput({
  onAnalyze,
  loading,
  tfTraining,
}) {
  const [text, setText] = useState("");

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const handleAnalyze = () => {
    if (!text.trim() || loading) return;
    onAnalyze(text);
  };

  const loadSample = (type) => {
    setText(SAMPLES[type]);
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter triggers analysis
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleAnalyze();
    }
  };

  return (
    <div style={{
      background:   THEME.surface,
      border:       `1px solid ${THEME.border}`,
      borderRadius: "8px",
      padding:      "22px",
      marginBottom: "24px",
    }}>

      {/* ── Header row ──────────────────────────────────────────────── */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   "14px",
        flexWrap:       "wrap",
        gap:            "10px",
      }}>
        <div style={{
          display:       "flex",
          alignItems:    "center",
          gap:           "8px",
          fontSize:      "10px",
          letterSpacing: "0.15em",
          color:         THEME.accent,
        }}>
          <div style={{
            width:        "3px",
            height:       "12px",
            background:   THEME.accent,
            borderRadius: "2px",
          }} />
          INPUT — JOB POSTING
        </div>

        {/* Sample buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { type: "scam",  color: "#ef4444", label: "LOAD SCAM SAMPLE"  },
            { type: "legit", color: "#22c55e", label: "LOAD LEGIT SAMPLE" },
          ].map(({ type, color, label }) => (
            <button
              key={type}
              onClick={() => loadSample(type)}
              style={{
                padding:       "5px 12px",
                fontSize:      "10px",
                letterSpacing: "0.08em",
                background:    "transparent",
                border:        `1px solid ${color}44`,
                color,
                cursor:        "pointer",
                borderRadius:  "4px",
                fontFamily:    "inherit",
                transition:    "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TF training warning ──────────────────────────────────────── */}
      {tfTraining && (
        <div style={{
          background:    "#1a0f00",
          border:        "1px solid #3d2200",
          borderRadius:  "5px",
          padding:       "10px 14px",
          marginBottom:  "12px",
          display:       "flex",
          alignItems:    "center",
          gap:           "8px",
          fontSize:      "11px",
          color:         "#f59e0b",
          fontFamily:    "'IBM Plex Sans', sans-serif",
        }}>
          <span>⟳</span>
          TensorFlow.js model is training in the background — 
          you can still analyze now using the rule engine only.
        </div>
      )}

      {/* ── Textarea ─────────────────────────────────────────────────── */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste the complete job posting here for analysis…&#10;&#10;Tip: Press Ctrl+Enter to analyze quickly."
        rows={10}
        style={{
          width:       "100%",
          background:  THEME.bg,
          border:      `1px solid ${THEME.border}`,
          color:       THEME.textMuted,
          padding:     "14px",
          fontSize:    "12px",
          lineHeight:  "1.7",
          borderRadius:"6px",
          resize:      "vertical",
          fontFamily:  "inherit",
          outline:     "none",
          transition:  "border-color 0.15s",
          boxSizing:   "border-box",
        }}
        onFocus={e => e.target.style.borderColor = THEME.accent}
        onBlur={e  => e.target.style.borderColor = THEME.border}
      />

      {/* ── Footer row ──────────────────────────────────────────────── */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginTop:      "12px",
        flexWrap:       "wrap",
        gap:            "10px",
      }}>
        {/* Word / char count */}
        <div style={{
          display:  "flex",
          gap:      "16px",
          fontSize: "11px",
          color:    THEME.textFaint,
        }}>
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          {text.length > 0 && (
            <button
              onClick={() => setText("")}
              style={{
                background: "transparent",
                border:     "none",
                color:      THEME.textDim,
                cursor:     "pointer",
                fontSize:   "11px",
                padding:    0,
                fontFamily: "inherit",
              }}
            >
              ✕ clear
            </button>
          )}
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          style={{
            padding:       "11px 28px",
            fontSize:      "11px",
            letterSpacing: "0.15em",
            background:    loading || !text.trim()
              ? "transparent"
              : "linear-gradient(135deg, #0d2540, #1a3a5c)",
            border:        `1px solid ${
              loading || !text.trim() ? THEME.border : "#1e5090"
            }`,
            color:         loading || !text.trim()
              ? THEME.textFaint
              : "#5aa0d8",
            cursor:        loading || !text.trim()
              ? "not-allowed"
              : "pointer",
            borderRadius:  "5px",
            fontFamily:    "inherit",
            fontWeight:    600,
            transition:    "all 0.15s",
          }}
        >
          {loading ? "ANALYZING…" : "▶  RUN ANALYSIS"}
        </button>
      </div>
    </div>
  );
}