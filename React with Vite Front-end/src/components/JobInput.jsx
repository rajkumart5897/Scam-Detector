// src/components/JobInput.jsx
import { useState }  from "react";
import { THEME }     from "../constants/config";

const SAMPLES = {
  scam: `Job Title: Work From Home - Earn $5000/week!

We are looking for motivated individuals to join our team as Data Entry Specialists. No experience needed! You will be processing simple online forms from home.

Requirements:
- Must be 18+
- Access to a computer
- Reliable internet connection

Compensation: $500-$5000 per week depending on performance
Training fee: $49.99 required to get started (refundable after 30 days)

To apply, send your full name, address, date of birth, and bank details to jobs@quickcash-online.net

Company: Global Opportunities LLC
No interviews required - immediate start!`,

  legit: `Software Engineer — Frontend (React)
Company: Stripe | Bengaluru, India (Hybrid)

About the Role:
Stripe is looking for a Frontend Engineer to join our Dashboard team. You will work on tools that help millions of businesses manage their payments.

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

export default function JobInput({ onAnalyze, loading, tfTraining }) {
  const [text, setText] = useState("");

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const handleAnalyze = () => {
    if (!text.trim() || loading) return;
    onAnalyze(text);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleAnalyze();
  };

  return (
    <div style={{
      background:   THEME.surface,
      border:       `1px solid ${THEME.border}`,
      borderRadius: "10px",
      padding:      "20px",
      marginBottom: "20px",
      boxShadow:    "0 1px 3px rgba(0,0,0,0.3)",
    }}>
      <style>{`
        .analyze-btn:hover:not(:disabled) {
          background: linear-gradient(135deg,#1e40af,#1d4ed8) !important;
          box-shadow: 0 0 20px rgba(59,130,246,0.4) !important;
          transform: translateY(-1px);
        }
        .sample-btn:hover {
          opacity: 1 !important;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Header */}
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
          fontWeight:    500,
        }}>
          <div style={{
            width:        "3px",
            height:       "12px",
            background:   THEME.accent,
            borderRadius: "2px",
            boxShadow:    `0 0 6px ${THEME.accent}`,
          }} />
          INPUT — JOB POSTING
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { type: "scam",  color: "#ef4444", label: "LOAD SCAM SAMPLE"  },
            { type: "legit", color: "#10b981", label: "LOAD LEGIT SAMPLE" },
          ].map(({ type, color, label }) => (
            <button
              key={type}
              className="sample-btn"
              onClick={() => setText(SAMPLES[type])}
              style={{
                padding:       "5px 12px",
                fontSize:      "10px",
                letterSpacing: "0.08em",
                background:    `${color}10`,
                border:        `1px solid ${color}30`,
                color,
                cursor:        "pointer",
                borderRadius:  "5px",
                fontFamily:    "inherit",
                fontWeight:    500,
                opacity:       0.8,
                transition:    "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Training warning */}
      {tfTraining && (
        <div style={{
          background:   "rgba(245,158,11,0.08)",
          border:       "1px solid rgba(245,158,11,0.2)",
          borderRadius: "6px",
          padding:      "9px 14px",
          marginBottom: "12px",
          display:      "flex",
          alignItems:   "center",
          gap:          "8px",
          fontSize:     "11px",
          color:        "#f59e0b",
          fontFamily:   "var(--font-sans, sans-serif)",
        }}>
          <span style={{ fontSize: "14px" }}>⟳</span>
          Connecting to backend — you can still analyze using the rule engine only.
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Paste the complete job posting here for analysis…\n\nTip: Press Ctrl+Enter to analyze quickly.`}
        rows={10}
        style={{
          width:        "100%",
          background:   "rgba(255,255,255,0.02)",
          border:       `1px solid ${THEME.border}`,
          color:        THEME.textPrimary,
          padding:      "14px",
          fontSize:     "12px",
          lineHeight:   "1.75",
          borderRadius: "7px",
          resize:       "vertical",
          fontFamily:   "inherit",
          outline:      "none",
          transition:   "border-color 0.15s, box-shadow 0.15s",
          boxSizing:    "border-box",
          caretColor:   THEME.accent,
        }}
        onFocus={e => {
          e.target.style.borderColor = THEME.accent;
          e.target.style.boxShadow   = "0 0 0 3px rgba(59,130,246,0.08)";
        }}
        onBlur={e => {
          e.target.style.borderColor = THEME.border;
          e.target.style.boxShadow   = "none";
        }}
      />

      {/* Footer */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginTop:      "12px",
        flexWrap:       "wrap",
        gap:            "10px",
      }}>
        <div style={{
          display:  "flex",
          gap:      "16px",
          fontSize: "11px",
          color:    THEME.textFaint,
        }}>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
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
                transition: "color 0.15s",
              }}
            >
              ✕ clear
            </button>
          )}
        </div>

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          style={{
            padding:       "10px 24px",
            fontSize:      "11px",
            letterSpacing: "0.12em",
            background:    loading || !text.trim()
              ? "transparent"
              : "linear-gradient(135deg, #1d4ed8, #2563eb)",
            border:        `1px solid ${
              loading || !text.trim() ? THEME.border : "#3b82f6"
            }`,
            color:         loading || !text.trim()
              ? THEME.textFaint : "#fff",
            cursor:        loading || !text.trim()
              ? "not-allowed" : "pointer",
            borderRadius:  "6px",
            fontFamily:    "inherit",
            fontWeight:    500,
            transition:    "all 0.15s",
            boxShadow:     loading || !text.trim()
              ? "none" : "0 0 16px rgba(59,130,246,0.2)",
          }}
        >
          {loading ? "ANALYZING…" : "▶  RUN ANALYSIS"}
        </button>
      </div>
    </div>
  );
}