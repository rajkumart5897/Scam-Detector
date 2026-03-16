import { RISK_CONFIG } from "../constants/config";
import { Badge }       from "./ui";

export default function RiskBanner({ result }) {
  const { score, riskLevel, verdict, recommendedAction } = result;
  const rc = RISK_CONFIG[riskLevel];

  const actionColor =
    recommendedAction === "AVOID"               ? "var(--danger)"  :
    recommendedAction === "PROCEED WITH CAUTION"? "var(--warning)" :
    "var(--success)";

  return (
    <div style={{
      border:       `1px solid ${rc.border}`,
      borderRadius: "10px",
      padding:      "20px 24px",
      background:   rc.bg,
      marginBottom: "16px",
      display:      "flex",
      alignItems:   "center",
      gap:          "20px",
      flexWrap:     "wrap",
      position:     "relative",
      overflow:     "hidden",
    }}>

      {/* Score */}
      <div style={{ textAlign: "center", minWidth: "64px" }}>
        <div style={{
          fontSize:   "40px",
          fontWeight: 700,
          color:      rc.color,
          lineHeight: 1,
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {score}
        </div>
        <div style={{
          fontSize:      "9px",
          color:         rc.color,
          opacity:       0.7,
          letterSpacing: "0.12em",
          marginTop:     "2px",
        }}>
          SCAM SCORE
        </div>
      </div>

      {/* Bar */}
      <div style={{ minWidth: "120px", flex: 1 }}>
        <div style={{
          height:       "4px",
          background:   "var(--border)",
          borderRadius: "2px",
          marginBottom: "6px",
          overflow:     "hidden",
        }}>
          <div style={{
            height:     "100%",
            width:      `${score}%`,
            background: `linear-gradient(90deg,
              var(--success) 0%,
              var(--warning) 50%,
              var(--danger)  100%)`,
            borderRadius: "2px",
            transition:   "width 1s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          fontSize:       "9px",
          letterSpacing:  "0.06em",
        }}>
          <span style={{ color: "var(--success)" }}>SAFE</span>
          <span style={{ color: "var(--danger)"  }}>SCAM</span>
        </div>
      </div>

      {/* Verdict */}
      <div style={{ flex: 2, minWidth: "180px" }}>
        <div style={{ marginBottom: "6px" }}>
          <Badge color={rc.color}>{rc.label}</Badge>
        </div>
        <div style={{
          fontSize:   "13px",
          color:      "var(--text-primary)",
          lineHeight: 1.5,
          fontFamily: "var(--font-sans)",
        }}>
          {verdict}
        </div>
      </div>

      {/* Action */}
      <div>
        <div style={{
          fontSize:      "9px",
          letterSpacing: "0.1em",
          color:         "var(--text-muted)",
          marginBottom:  "6px",
          textAlign:     "center",
        }}>
          ACTION
        </div>
        <div style={{
          padding:      "6px 14px",
          borderRadius: "5px",
          background:   `${actionColor}15`,
          border:       `1px solid ${actionColor}30`,
          fontSize:     "10px",
          fontWeight:   600,
          color:        actionColor,
          letterSpacing:"0.1em",
          textAlign:    "center",
          whiteSpace:   "nowrap",
        }}>
          {recommendedAction}
        </div>
      </div>
    </div>
  );
}