// src/components/Header.jsx
// Top navigation bar. Shows app name, model status,
// and a live indicator when TF.js is training or ready.

import { THEME } from "../constants/config";

export default function Header({ tfReady, tfTraining }) {

  // ── Status indicator config ─────────────────────────────────────────────────
  const status = tfTraining
    ? { color: "#f59e0b", label: "MODEL TRAINING…", pulse: true  }
    : tfReady
      ? { color: "#22c55e", label: "MODEL READY",    pulse: true  }
      : { color: "#ef4444", label: "MODEL OFFLINE",  pulse: false };

  return (
    <header style={{
      background:   THEME.surfaceAlt,
      borderBottom: `1px solid ${THEME.border}`,
      padding:      "0 32px",
      height:       "56px",
      display:      "flex",
      alignItems:   "center",
      gap:          "16px",
      position:     "sticky",
      top:          0,
      zIndex:       100,
    }}>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.3; }
        }
      `}</style>

      {/* Logo mark */}
      <div style={{
        width:          "30px",
        height:         "30px",
        borderRadius:   "6px",
        background:     "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "16px",
        flexShrink:     0,
      }}>
        ⚑
      </div>

      {/* App name */}
      <div>
        <div style={{
          fontSize:      "14px",
          fontWeight:    700,
          letterSpacing: "0.12em",
          color:         THEME.textPrimary,
          lineHeight:    1,
        }}>
          SCAM·DETECT
        </div>
        <div style={{
          fontSize:      "9px",
          color:         THEME.textFaint,
          letterSpacing: "0.1em",
          marginTop:     "3px",
        }}>
          ML-POWERED JOB FRAUD ANALYSIS
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* TF.js status */}
      <div style={{
        display:    "flex",
        alignItems: "center",
        gap:        "7px",
      }}>
        <div style={{
          width:        "7px",
          height:       "7px",
          borderRadius: "50%",
          background:   status.color,
          flexShrink:   0,
          animation:    status.pulse
            ? "pulse-dot 2s ease-in-out infinite"
            : "none",
        }} />
        <span style={{
          fontSize:      "10px",
          color:         status.color,
          letterSpacing: "0.1em",
        }}>
          {status.label}
        </span>
      </div>

      {/* Window controls (decorative) */}
      <div style={{
        display:    "flex",
        gap:        "5px",
        marginLeft: "16px",
      }}>
        {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
          <div key={i} style={{
            width:        "10px",
            height:       "10px",
            borderRadius: "50%",
            background:   c,
            opacity:      0.6,
          }} />
        ))}
      </div>
    </header>
  );
}