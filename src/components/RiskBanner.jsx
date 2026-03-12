// src/components/RiskBanner.jsx
// The prominent risk banner shown above the result tabs.
// Displays score, risk level, verdict, and recommended action.

import { THEME, RISK_CONFIG } from "../constants/config";
import { Badge }              from "./ui";

export default function RiskBanner({ result }) {
  const { score, riskLevel, verdict, recommendedAction } = result;
  const rc = RISK_CONFIG[riskLevel];

  const actionColor =
    recommendedAction === "AVOID"
      ? "#ef4444"
      : recommendedAction === "PROCEED WITH CAUTION"
        ? "#f59e0b"
        : "#22c55e";

  return (
    <div style={{
      border:       `1px solid ${rc.border}`,
      borderRadius: "8px",
      padding:      "22px 28px",
      background:   rc.bg,
      marginBottom: "20px",
      boxShadow:    `0 0 40px ${rc.glow}`,
      display:      "flex",
      alignItems:   "center",
      gap:          "24px",
      flexWrap:     "wrap",
    }}>

      {/* Score */}
      <div style={{ textAlign: "center", minWidth: "70px" }}>
        <div style={{
          fontSize:   "46px",
          fontWeight: 700,
          color:      rc.color,
          lineHeight: 1,
        }}>
          {score}
        </div>
        <div style={{
          fontSize:      "9px",
          color:         rc.color,
          opacity:       0.6,
          letterSpacing: "0.12em",
        }}>
          SCAM SCORE
        </div>
      </div>

      {/* Score bar */}
      <div style={{ minWidth: "140px", flex: 1 }}>
        <div style={{
          height:       "6px",
          background:   THEME.border,
          borderRadius: "3px",
          marginBottom: "6px",
          overflow:     "hidden",
        }}>
          <div style={{
            height:     "100%",
            width:      `${score}%`,
            background: `linear-gradient(90deg,
              #22c55e 0%,
              #f59e0b 55%,
              #ef4444 100%)`,
            borderRadius: "3px",
            transition:   "width 1s ease",
          }} />
        </div>
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          fontSize:       "9px",
        }}>
          <span style={{ color: "#22c55e" }}>0 — SAFE</span>
          <span style={{ color: "#ef4444" }}>100 — SCAM</span>
        </div>
      </div>

      {/* Verdict */}
      <div style={{ flex: 2, minWidth: "200px" }}>
        <Badge color={rc.color} style={{ marginBottom: "8px" }}>
          {rc.label}
        </Badge>
        <div style={{
          fontSize:   "13px",
          color:      THEME.textPrimary,
          lineHeight: 1.6,
          fontFamily: "'IBM Plex Sans', sans-serif",
          marginTop:  "6px",
        }}>
          {verdict}
        </div>
      </div>

      {/* Recommended action */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize:      "9px",
          letterSpacing: "0.1em",
          color:         THEME.textDim,
          marginBottom:  "6px",
        }}>
          RECOMMENDED ACTION
        </div>
        <Badge color={actionColor} style={{
          fontSize: "11px",
          padding:  "5px 14px",
        }}>
          {recommendedAction}
        </Badge>
      </div>
    </div>
  );
}