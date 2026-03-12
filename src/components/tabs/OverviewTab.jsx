// src/components/tabs/OverviewTab.jsx
// First results tab. Shows the high-level picture:
//   - Executive summary paragraph
//   - Red flag severity breakdown
//   - Positive legitimacy signals
//   - Matched known scam patterns
//   - Engine score comparison (rules vs TF.js vs combined)

import { Card, Badge, SectionTitle } from "../ui";
import { SEVERITY_COLOR, THEME }     from "../../constants/config";

export default function OverviewTab({ result }) {
  const { 
    executiveSummary,
    redFlags,
    positives,
    scamPatterns,
    engineScores,
    totalRulesChecked,
    totalRulesFired,
  } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Executive Summary ─────────────────────────────────────────── */}
      <Card>
        <SectionTitle>Executive Summary</SectionTitle>
        <p style={{
          fontSize:    "13px",
          lineHeight:  "1.85",
          color:       THEME.textMuted,
          margin:      0,
          fontFamily:  "'IBM Plex Sans', sans-serif",
        }}>
          {executiveSummary}
        </p>
      </Card>

      {/* ── Two column row ────────────────────────────────────────────── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "16px",
      }}>

        {/* Red Flag Severity Breakdown */}
        <Card>
          <SectionTitle accent={SEVERITY_COLOR.HIGH}>
            Red Flags ({redFlags.length})
          </SectionTitle>

          {redFlags.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#22c55e" }}>
              No red flags detected.
            </div>
          ) : (
            <>
              {/* Severity rows */}
              {["HIGH", "MEDIUM", "LOW"].map(sev => {
                const count = redFlags.filter(f => f.severity === sev).length;
                if (count === 0) return null;
                const color = SEVERITY_COLOR[sev];
                return (
                  <div key={sev} style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    marginBottom:   "12px",
                  }}>
                    <div style={{
                      display:    "flex",
                      alignItems: "center",
                      gap:        "8px",
                    }}>
                      <div style={{
                        width:        "8px",
                        height:       "8px",
                        borderRadius: "50%",
                        background:   color,
                        flexShrink:   0,
                      }} />
                      <span style={{
                        fontSize:      "11px",
                        color:         THEME.textDim,
                        letterSpacing: "0.08em",
                      }}>
                        {sev} SEVERITY
                      </span>
                    </div>
                    <span style={{
                      fontSize:   "15px",
                      fontWeight: 700,
                      color,
                    }}>
                      {count}
                    </span>
                  </div>
                );
              })}

              {/* Mini progress bar per severity */}
              <div style={{
                height:       "4px",
                background:   THEME.border,
                borderRadius: "2px",
                overflow:     "hidden",
                marginTop:    "4px",
                display:      "flex",
              }}>
                {["HIGH","MEDIUM","LOW"].map(sev => {
                  const count = redFlags.filter(f => f.severity === sev).length;
                  const pct   = redFlags.length > 0
                    ? (count / redFlags.length) * 100
                    : 0;
                  return (
                    <div key={sev} style={{
                      width:      `${pct}%`,
                      background: SEVERITY_COLOR[sev],
                      transition: "width 0.6s ease",
                    }} />
                  );
                })}
              </div>

              <div style={{
                fontSize:   "10px",
                color:      THEME.textFaint,
                marginTop:  "8px",
                letterSpacing: "0.08em",
              }}>
                {totalRulesFired} of {totalRulesChecked} rules triggered
              </div>
            </>
          )}
        </Card>

        {/* Positive Signals */}
        <Card>
          <SectionTitle accent="#22c55e">
            Positive Signals ({positives.length})
          </SectionTitle>

          {positives.length === 0 ? (
            <div style={{ fontSize: "12px", color: THEME.textDim }}>
              No positive legitimacy signals detected.
            </div>
          ) : (
            positives.map((p, i) => (
              <div key={i} style={{
                display:      "flex",
                gap:          "8px",
                marginBottom: "10px",
                alignItems:   "flex-start",
              }}>
                <span style={{
                  color:     "#22c55e",
                  fontSize:  "11px",
                  marginTop: "2px",
                  flexShrink: 0,
                }}>
                  ▸
                </span>
                <div>
                  <span style={{
                    fontSize:   "12px",
                    color:      THEME.textMuted,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    lineHeight: "1.5",
                  }}>
                    {p.signal}
                  </span>
                  <span style={{ marginLeft: "6px" }}>
                    <Badge color={
                      p.weight === "STRONG"   ? "#22c55e" :
                      p.weight === "MODERATE" ? "#f59e0b" :
                      THEME.textDim
                    }>
                      {p.weight}
                    </Badge>
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* ── Engine Score Comparison ───────────────────────────────────── */}
      <Card>
        <SectionTitle>Engine Score Breakdown</SectionTitle>
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap:                 "12px",
        }}>
          {[
            {
              label: "Rule Engine",
              value: engineScores.rules,
              desc:  "Pattern & keyword matching",
              color: "#4a90d9",
            },
            {
              label: "TF.js Classifier",
              value: engineScores.tfAvailable
                ? engineScores.tensorflow
                : "N/A",
              desc:  engineScores.tfAvailable
                ? "Neural network prediction"
                : "Training in progress…",
              color: engineScores.tfAvailable ? "#a78bfa" : THEME.textFaint,
            },
            {
              label: "Combined Score",
              value: engineScores.combined,
              desc:  "Weighted final score",
              color: engineScores.combined >= 70 ? "#ef4444" :
                     engineScores.combined >= 40 ? "#f59e0b" : "#22c55e",
            },
          ].map(({ label, value, desc, color }) => (
            <div key={label} style={{
              background:   THEME.bg,
              border:       `1px solid ${THEME.border}`,
              borderRadius: "6px",
              padding:      "14px",
              textAlign:    "center",
            }}>
              <div style={{
                fontSize:      "9px",
                letterSpacing: "0.12em",
                color:         THEME.textDim,
                marginBottom:  "8px",
              }}>
                {label.toUpperCase()}
              </div>
              <div style={{
                fontSize:   "28px",
                fontWeight: 700,
                color,
                lineHeight: 1,
              }}>
                {typeof value === "number" ? value : value}
              </div>
              {/* Mini bar */}
              {typeof value === "number" && (
                <div style={{
                  height:       "3px",
                  background:   THEME.border,
                  borderRadius: "2px",
                  margin:       "10px 0 8px",
                  overflow:     "hidden",
                }}>
                  <div style={{
                    height:     "100%",
                    width:      `${value}%`,
                    background: color,
                    borderRadius: "2px",
                    transition: "width 0.8s ease",
                  }} />
                </div>
              )}
              <div style={{
                fontSize:   "10px",
                color:      THEME.textFaint,
                lineHeight: 1.4,
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Matched Scam Patterns ─────────────────────────────────────── */}
      {scamPatterns.length > 0 && (
        <Card>
          <SectionTitle accent="#f59e0b">
            Matched Known Scam Patterns
          </SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {scamPatterns.map((p, i) => (
              <Badge key={i} color="#f59e0b" style={{ fontSize: "11px", padding: "4px 12px" }}>
                {p}
              </Badge>
            ))}
          </div>
          <p style={{
            fontSize:   "11px",
            color:      THEME.textFaint,
            margin:     "12px 0 0",
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.6,
          }}>
            Patterns matched against a taxonomy of known employment fraud types.
            Multiple pattern matches significantly increase likelihood of fraud.
          </p>
        </Card>
      )}

    </div>
  );
}