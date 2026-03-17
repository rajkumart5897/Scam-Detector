// src/components/Header.jsx
import { useState, useEffect } from "react";

export default function Header({ tfReady, tfTraining }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(t => t === "dark" ? "light" : "dark");

  const status = tfTraining
    ? { color: "var(--warning)", label: "CONNECTING", pulse: true  }
    : tfReady
      ? { color: "var(--success)", label: "LIVE",      pulse: true  }
      : { color: "var(--danger)",  label: "OFFLINE",   pulse: false };

  return (
    <header style={{
      position:       "sticky",
      top:            0,
      zIndex:         100,
      background:     "var(--bg)",
      borderBottom:   "1px solid var(--border)",
      height:         "52px",
      display:        "flex",
      alignItems:     "center",
      padding:        "0 24px",
      gap:            "12px",
    }}>
      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; } 50% { opacity:0.3; }
        }
        .theme-btn:hover { background: var(--bg-hover) !important; }
        .header-logo { transition: transform 0.2s; }
        .header-logo:hover { transform: scale(1.05); }
      `}</style>

      {/* Logo */}
      <img
        src="/logo.svg"
        alt="ScamDetect"
        className="header-logo"
        style={{
          width:      "32px",
          height:     "32px",
          flexShrink: 0,
          filter:     "drop-shadow(0 0 2px var(--accent))",}}
      />

      {/* Brand */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{
          fontSize:      "13px",
          fontWeight:    600,
          letterSpacing: "0.06em",
          color:         "var(--text-primary)",
        }}>
          SCAM·DETECT
        </span>
        <span style={{
          fontSize:  "10px",
          color: "var(--text-muted)",
          letterSpacing: "0.05em",
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
        background:   "var(--bg-elevated)",
        border:       "1px solid var(--border)",
        borderRadius: "20px",
        padding:      "4px 12px",
      }}>
        <div style={{
          width:        "6px",
          height:       "6px",
          borderRadius: "50%",
          background:   status.color,
          animation:    status.pulse
            ? "pulse-dot 2s ease-in-out infinite" : "none",
          flexShrink:   0,
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

      {/* Theme toggle */}
      <button
        className="theme-btn"
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        style={{
          width:        "32px",
          height:       "32px",
          borderRadius: "6px",
          background:   "transparent",
          border:       "1px solid var(--border)",
          color:        "var(--text-muted)",
          cursor:       "pointer",
          fontSize:     "14px",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          transition:   "all 0.15s",
          flexShrink:   0,
        }}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>

      {/* Window dots */}
      <div style={{ display: "flex", gap: "5px", marginLeft: "4px" }}>
        {["var(--danger)","var(--warning)","var(--success)"].map((c,i) => (
          <div key={i} style={{
            width:        "10px",
            height:       "10px",
            borderRadius: "50%",
            background:   c,
            opacity:      0.5,
          }} />
        ))}
      </div>
    </header>
  );
}