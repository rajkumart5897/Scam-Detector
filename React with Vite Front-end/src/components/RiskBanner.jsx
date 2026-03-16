import { THEME, RISK_CONFIG } from "../constants/config";
import { Badge } from "./ui";

export default function RiskBanner({ result }) {
  const { score, riskLevel, verdict, recommendedAction } = result;
  const rc = RISK_CONFIG[riskLevel];

  const actionColor =
    recommendedAction === "AVOID" ? "#ef4444" :
    recommendedAction === "PROCEED WITH CAUTION" ? "#f59e0b" : "#10b981";

  return (
    <div style={{
      border:       `1px solid ${rc.border}`,
      borderRadius: "10px",
      padding:      "20px 24px",
      background:   rc.bg,
      marginBottom: "16px",
      boxShadow:    `0 0 30px ${rc.glow}, 0 1px 3px rgba(0,0,0,0.4)`,
      display:      "flex",
      alignItems:   "center",
      gap:          "20px",
      flexWrap:     "wrap",
      position:     "relative",
      overflow:     "hidden",
    }}>
      {/* Subtle background pattern */}
      <div style={{
        position:   "absolute",
        inset:      0,
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 40px,
          ${rc.border}08 40px,
          ${rc.border}08 41px
        )`,
        pointerEvents: "none",
      }} />

      {/* Score */}
      <div style={{ textAlign: "center", minWidth: "64px", position: "relative" }}>
        <div style={{
          fontSize:   "42px",
          fontWeight: 700,
          color:      rc.color,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}>
          {score}
        </div>
        <div style={{
          fontSize:      "9px",
          color:         rc.color,
          opacity:       0.6,
          letterSpacing: "0.15em",
          marginTop:     "2px",
        }}>
          SCAM SCORE
        </div>
      </div>

      {/* Bar */}
      <div style={{ minWidth: "120px", flex: 1, position: "relative" }}>
        <div style={{
          height:       "4px",
          background:   "rgba(255,255,255,0.06)",
          borderRadius: "2px",
          marginBottom: "5px",
          overflow:     "hidden",
        }}>
          <div style={{
            height:       "100%",
            width:        `${score}%`,
            background:   `linear-gradient(90deg, #10b981, #f59e0b 50%, #ef4444)`,
            borderRadius: "2px",
            transition:   "width 1s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          fontSize:       "9px",
          letterSpacing:  "0.08em",
        }}>
          <span style={{ color: "#10b981" }}>SAFE</span>
          <span style={{ color: "#ef4444" }}>SCAM</span>
        </div>
      </div>

      {/* Verdict */}
      <div style={{ flex: 2, minWidth: "180px", position: "relative" }}>
        <div style={{ marginBottom: "6px" }}>
          <Badge color={rc.color}>{rc.label}</Badge>
        </div>
        <div style={{
          fontSize:   "13px",
          color:      THEME.textPrimary,
          lineHeight: 1.5,
          fontFamily: "var(--font-sans, sans-serif)",
        }}>
          {verdict}
        </div>
      </div>

      {/* Action */}
      <div style={{ position: "relative" }}>
        <div style={{
          fontSize:      "9px",
          letterSpacing: "0.1em",
          color:         THEME.textMuted,
          marginBottom:  "6px",
          textAlign:     "center",
        }}>
          ACTION
        </div>
        <div style={{
          padding:      "6px 14px",
          borderRadius: "5px",
          background:   `${actionColor}15`,
          border:       `1px solid ${actionColor}40`,
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