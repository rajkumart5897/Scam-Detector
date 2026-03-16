// src/components/Header.jsx
import { THEME } from "../constants/config";

export default function Header({ tfReady, tfTraining }) {
  const status = tfTraining
    ? { color: "#f59e0b", label: "CONNECTING",   pulse: true  }
    : tfReady
      ? { color: "#10b981", label: "LIVE",        pulse: true  }
      : { color: "#ef4444", label: "OFFLINE",     pulse: false };

  return (
    <header style={{
      position:     "sticky",
      top:          0,
      zIndex:       100,
      background:   "rgba(8,11,15,0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${THEME.border}`,
      height:       "52px",
      display:      "flex",
      alignItems:   "center",
      padding:      "0 28px",
      gap:          "12px",
    }}>
      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; } 50% { opacity:0.3; }
        }
      `}</style>

      {/* Logo */}
      <div style={{
        width:          "26px",
        height:         "26px",
        borderRadius:   "5px",
        background:     "linear-gradient(135deg, #ef4444, #f59e0b)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "13px",
        flexShrink:     0,
        boxShadow:      "0 0 12px rgba(239,68,68,0.3)",
      }}>
        ⚑
      </div>

      {/* Brand */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{
          fontSize:      "13px",
          fontWeight:    600,
          letterSpacing: "0.08em",
          color:         THEME.textPrimary,
        }}>
          SCAM·DETECT
        </span>
        <span style={{
          fontSize:      "10px",
          color:         THEME.textFaint,
          letterSpacing: "0.06em",
        }}>
          ML FRAUD ANALYSIS
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Status pill */}
      <div style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "6px",
        background:   THEME.surface,
        border:       `1px solid ${THEME.border}`,
        borderRadius: "20px",
        padding:      "4px 12px",
      }}>
        <div style={{
          width:        "6px",
          height:       "6px",
          borderRadius: "50%",
          background:   status.color,
          boxShadow:    `0 0 6px ${status.color}`,
          animation:    status.pulse ? "pulse-dot 2s infinite" : "none",
        }} />
        <span style={{
          fontSize:      "10px",
          color:         status.color,
          letterSpacing: "0.1em",
          fontWeight:    500,
        }}>
          {status.label}
        </span>
      </div>

      {/* Window dots */}
      <div style={{ display: "flex", gap: "5px", marginLeft: "8px" }}>
        {["#ef4444","#f59e0b","#10b981"].map((c,i) => (
          <div key={i} style={{
            width: "10px", height: "10px",
            borderRadius: "50%", background: c, opacity: 0.5,
          }} />
        ))}
      </div>
    </header>
  );
}