// src/App.jsx
// Root component. Owns the top-level state and wires
// everything together. Keeps it intentionally simple —
// all logic lives in the hook, all UI lives in components.

import { useAnalysis }  from "./hooks/useAnalysis";
import Header           from "./components/Header";
import JobInput         from "./components/JobInput";
import ResultPanel      from "./components/ResultPanel";
import { THEME }        from "./constants/config";

// ─── Loading skeleton ─────────────────────────────────────────────────────────
// Shown while analysis is running.

function LoadingSkeleton() {
  return (
    <div style={{
      border:       `1px solid ${THEME.border}`,
      borderRadius: "8px",
      padding:      "48px",
      textAlign:    "center",
      background:   THEME.surface,
      position:     "relative",
      overflow:     "hidden",
    }}>
      <style>{`
        @keyframes scan-line {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(500%);  }
        }
        @keyframes bar-pulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 1;   }
        }
      `}</style>

      {/* Scanning line */}
      <div style={{
        position:   "absolute",
        top:        0,
        left:       0,
        right:      0,
        height:     "2px",
        background: `linear-gradient(90deg,
          transparent, ${THEME.accent}, transparent)`,
        animation:  "scan-line 1.6s linear infinite",
      }} />

      <div style={{
        fontSize:      "11px",
        letterSpacing: "0.2em",
        color:         THEME.textDim,
        marginBottom:  "24px",
      }}>
        RUNNING ML PIPELINE
      </div>

      {/* Animated bars */}
      <div style={{
        display:        "flex",
        gap:            "4px",
        justifyContent: "center",
        marginBottom:   "20px",
      }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{
            width:        "4px",
            height:       "24px",
            background:   THEME.border,
            borderRadius: "2px",
            animation:    `bar-pulse 1.2s ease-in-out
              ${i * 0.08}s infinite`,
          }} />
        ))}
      </div>

      <div style={{
        fontSize:      "10px",
        color:         THEME.textFaint,
        letterSpacing: "0.1em",
        fontFamily:    "'IBM Plex Sans', sans-serif",
      }}>
        Extracting features · Scoring signals · Evaluating model
      </div>
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onDismiss }) {
  return (
    <div style={{
      border:       "1px solid #3d0f0f",
      borderRadius: "8px",
      padding:      "16px 20px",
      background:   "#1a0505",
      color:        "#ef4444",
      fontSize:     "13px",
      display:      "flex",
      justifyContent: "space-between",
      alignItems:   "center",
      fontFamily:   "'IBM Plex Sans', sans-serif",
    }}>
      <span>✕ {message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: "transparent",
          border:     "none",
          color:      "#ef4444",
          cursor:     "pointer",
          fontSize:   "16px",
          padding:    "0 0 0 16px",
          fontFamily: "inherit",
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
// Shown before any analysis has been run.

function EmptyState() {
  const features = [
    {
      icon:  "⚑",
      title: "Rule Engine",
      desc:  "14 pattern rules across 6 fraud categories",
    },
    {
      icon:  "◈",
      title: "TF.js Neural Net",
      desc:  "Bag-of-words classifier trained in-browser",
    },
    {
      icon:  "◎",
      title: "Forensic Evidence",
      desc:  "Exact quotes extracted from the posting",
    },
    {
      icon:  "▦",
      title: "ML Metrics",
      desc:  "Precision, recall, F1 & confusion matrix",
    },
  ];

  return (
    <div style={{
      border:       `1px solid ${THEME.border}`,
      borderRadius: "8px",
      padding:      "48px 32px",
      background:   THEME.surface,
      textAlign:    "center",
    }}>
      <div style={{
        fontSize:      "32px",
        marginBottom:  "12px",
        opacity:       0.4,
      }}>
        ⚑
      </div>
      <div style={{
        fontSize:      "14px",
        color:         THEME.textPrimary,
        fontWeight:    700,
        letterSpacing: "0.08em",
        marginBottom:  "8px",
      }}>
        PASTE A JOB POSTING TO BEGIN
      </div>
      <div style={{
        fontSize:      "12px",
        color:         THEME.textDim,
        fontFamily:    "'IBM Plex Sans', sans-serif",
        marginBottom:  "32px",
        lineHeight:    1.6,
        maxWidth:      "400px",
        margin:        "0 auto 32px",
      }}>
        The hybrid ML engine will analyze it for fraud indicators
        and generate a detailed forensic report.
      </div>

      {/* Feature grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap:                 "12px",
        maxWidth:            "600px",
        margin:              "0 auto",
      }}>
        {features.map(({ icon, title, desc }) => (
          <div key={title} style={{
            background:   THEME.bg,
            border:       `1px solid ${THEME.border}`,
            borderRadius: "6px",
            padding:      "16px 12px",
          }}>
            <div style={{
              fontSize:     "20px",
              marginBottom: "8px",
              color:        THEME.accent,
            }}>
              {icon}
            </div>
            <div style={{
              fontSize:      "11px",
              fontWeight:    700,
              color:         THEME.textPrimary,
              marginBottom:  "4px",
              letterSpacing: "0.06em",
            }}>
              {title}
            </div>
            <div style={{
              fontSize:   "10px",
              color:      THEME.textFaint,
              fontFamily: "'IBM Plex Sans', sans-serif",
              lineHeight: 1.5,
            }}>
              {desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const {
    result,
    loading,
    error,
    tfReady,
    tfTraining,
    analyze,
    reset,
  } = useAnalysis();

  return (
    <div style={{
      minHeight:  "100vh",
      background: THEME.bg,
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color:      THEME.textMuted,
    }}>

      {/* Sticky header */}
      <Header tfReady={tfReady} tfTraining={tfTraining} />

      {/* Main content */}
      <main style={{
        maxWidth: "960px",
        margin:   "0 auto",
        padding:  "32px 24px 80px",
      }}>

        {/* Input panel — always visible */}
        <JobInput
          onAnalyze={analyze}
          loading={loading}
          tfTraining={tfTraining}
        />

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom: "20px" }}>
            <ErrorBanner message={error} onDismiss={reset} />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <LoadingSkeleton />}

        {/* Results — key forces ResultPanel to remount
            (resets activeTab to "overview") on each new result */}
        {!loading && result && (
          <ResultPanel
            key={result.analyzedAt}
            result={result}
          />
        )}

        {/* Empty state */}
        {!loading && !result && !error && <EmptyState />}

      </main>
    </div>
  );
}