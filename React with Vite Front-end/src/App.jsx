// src/App.jsx
import { useAnalysis }  from "./hooks/useAnalysis";
import Header           from "./components/Header";
import JobInput         from "./components/JobInput";
import ResultPanel      from "./components/ResultPanel";
import { THEME }        from "./constants/config";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

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
      <div style={{
        position:   "absolute",
        top:        0, left: 0, right: 0,
        height:     "2px",
        background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
        animation:  "scan-line 1.6s linear infinite",
      }} />
      <div style={{
        fontSize:      "11px",
        letterSpacing: "0.2em",
        color:         THEME.textDim,
        marginBottom:  "24px",
      }}>
        RUNNING ML PIPELINE — 5 MODELS
      </div>
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
            animation:    `bar-pulse 1.2s ease-in-out ${i * 0.08}s infinite`,
          }} />
        ))}
      </div>
      <div style={{
        fontSize:      "10px",
        color:         THEME.textFaint,
        letterSpacing: "0.1em",
        fontFamily:    "'IBM Plex Sans', sans-serif",
      }}>
        LR · Naive Bayes · Random Forest · SVM · DistilBERT
      </div>
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onDismiss }) {
  return (
    <div style={{
      border:         "1px solid #3d0f0f",
      borderRadius:   "8px",
      padding:        "16px 20px",
      background:     "#1a0505",
      color:          "#ef4444",
      fontSize:       "13px",
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      fontFamily:     "'IBM Plex Sans', sans-serif",
      marginBottom:   "20px",
    }}>
      <span>✕ {message}</span>
      <button onClick={onDismiss} style={{
        background: "transparent",
        border:     "none",
        color:      "#ef4444",
        cursor:     "pointer",
        fontSize:   "18px",
        padding:    "0 0 0 16px",
      }}>✕</button>
    </div>
  );
}

// ─── Backend offline banner ───────────────────────────────────────────────────

function BackendOfflineBanner() {
  return (
    <div style={{
      border:       "1px solid #3d2200",
      borderRadius: "6px",
      padding:      "12px 16px",
      background:   "#1a0f00",
      color:        "#f59e0b",
      fontSize:     "12px",
      marginBottom: "16px",
      fontFamily:   "'IBM Plex Sans', sans-serif",
      display:      "flex",
      alignItems:   "center",
      gap:          "8px",
    }}>
      <span>⚠</span>
      Flask backend is offline. Run{" "}
      <code style={{
        background:   "#0d0800",
        padding:      "2px 6px",
        borderRadius: "3px",
        fontSize:     "11px",
      }}>
        python3 app.py
      </code>
      {" "}in your backend folder then refresh.
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const features = [
    { icon: "⚑", title: "Rule Engine",         desc: "14 pattern rules across 6 fraud categories" },
    { icon: "◈", title: "5 ML Models",          desc: "LR · NB · RF · SVM · DistilBERT ensemble"  },
    { icon: "◎", title: "Forensic Evidence",    desc: "Exact quotes extracted from the posting"    },
    { icon: "▦", title: "SQLite History",       desc: "Every scan saved with full model scores"    },
  ];

  return (
    <div style={{
      border:       `1px solid ${THEME.border}`,
      borderRadius: "8px",
      padding:      "48px 32px",
      background:   THEME.surface,
      textAlign:    "center",
    }}>
      <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>⚑</div>
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
        fontSize:     "12px",
        color:        THEME.textDim,
        fontFamily:   "'IBM Plex Sans', sans-serif",
        marginBottom: "32px",
        lineHeight:   1.6,
        maxWidth:     "400px",
        margin:       "0 auto 32px",
      }}>
        5 ML models analyze it in parallel and generate a detailed forensic report.
      </div>
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
            <div style={{ fontSize: "20px", marginBottom: "8px", color: THEME.accent }}>
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
    backendReady,
    backendChecking,
    bertReady,
    hardwareInfo,
    history,
    historyStats,
    historyLoading,
    analyze,
    reset,
    removeFromHistory,
    giveFeedback,
  } = useAnalysis();

  return (
    <div style={{
      minHeight:  "100vh",
      background: THEME.bg,
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color:      THEME.textMuted,
    }}>
      {/* Sticky header */}
      <Header
        tfReady={backendReady}
        tfTraining={backendChecking}
      />

      <main style={{
  maxWidth:   "900px",
  margin:     "0 auto",
  padding:    "28px 20px 80px",
}}>

        {/* Backend offline warning */}
        {!backendChecking && !backendReady && (
          <BackendOfflineBanner />
        )}

        {/* Input panel */}
        <JobInput
          onAnalyze={analyze}
          loading={loading}
          tfTraining={backendChecking}
        />

        {/* Error */}
        {error && (
          <ErrorBanner message={error} onDismiss={reset} />
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Results */}
        {!loading && result && (
          <ResultPanel
            key={result.analyzedAt}
            result={result}
            history={history}
            historyStats={historyStats}
            historyLoading={historyLoading}
            onDelete={removeFromHistory}
            onFeedback={giveFeedback}
          />
        )}

        {/* Empty state */}
        {!loading && !result && !error && <EmptyState />}

      </main>
    </div>
  );
}