// src/components/tabs/OverviewTab.jsx
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
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Executive Summary ─────────────────────────────────────── */}
      <Card>
        <SectionTitle>Executive Summary</SectionTitle>
        <p style={{
          fontSize:   "13px",
          lineHeight: "1.85",
          color:      THEME.textMuted,
          margin:     0,
          fontFamily: "var(--font-sans, sans-serif)",
        }}>
          {executiveSummary}
        </p>
      </Card>

      {/* ── Two column ────────────────────────────────────────────── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "14px",
      }}>

        {/* Red Flags */}
        <Card>
          <SectionTitle accent={SEVERITY_COLOR.HIGH}>
            Red Flags ({redFlags.length})
          </SectionTitle>

          {redFlags.length === 0 ? (
            <div style={{
              fontSize:   "12px",
              color:      "#10b981",
              fontFamily: "var(--font-sans, sans-serif)",
            }}>
              No red flags detected.
            </div>
          ) : (
            <>
              {["HIGH","MEDIUM","LOW"].map(sev => {
                const count = redFlags.filter(f => f.severity === sev).length;
                if (!count) return null;
                const color = SEVERITY_COLOR[sev];
                return (
                  <div key={sev} style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    marginBottom:   "10px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width:        "7px",
                        height:       "7px",
                        borderRadius: "50%",
                        background:   color,
                        boxShadow:    `0 0 6px ${color}`,
                        flexShrink:   0,
                      }} />
                      <span style={{
                        fontSize:      "11px",
                        color:         THEME.textDim,
                        letterSpacing: "0.06em",
                      }}>
                        {sev}
                      </span>
                    </div>
                    <span style={{
                      fontSize:   "15px",
                      fontWeight: 600,
                      color,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {count}
                    </span>
                  </div>
                );
              })}

              {/* Stacked bar */}
              <div style={{
                height:       "3px",
                background:   THEME.border,
                borderRadius: "2px",
                overflow:     "hidden",
                display:      "flex",
                marginTop:    "4px",
              }}>
                {["HIGH","MEDIUM","LOW"].map(sev => {
                  const count = redFlags.filter(f => f.severity === sev).length;
                  const pct   = redFlags.length > 0
                    ? (count / redFlags.length) * 100 : 0;
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
                fontSize:      "10px",
                color:         THEME.textFaint,
                marginTop:     "8px",
                letterSpacing: "0.06em",
              }}>
                {totalRulesFired} of {totalRulesChecked} rules triggered
              </div>
            </>
          )}
        </Card>

        {/* Positive Signals */}
        <Card>
          <SectionTitle accent="#10b981">
            Positive Signals ({positives.length})
          </SectionTitle>

          {positives.length === 0 ? (
            <div style={{
              fontSize:   "12px",
              color:      THEME.textDim,
              fontFamily: "var(--font-sans, sans-serif)",
            }}>
              No positive signals detected.
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
                  color:      "#10b981",
                  fontSize:   "11px",
                  marginTop:  "2px",
                  flexShrink: 0,
                }}>
                  ▸
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize:   "12px",
                    color:      THEME.textMuted,
                    fontFamily: "var(--font-sans, sans-serif)",
                    lineHeight: 1.5,
                  }}>
                    {p.signal}
                  </span>
                  <Badge color={
                    p.weight === "STRONG"   ? "#10b981" :
                    p.weight === "MODERATE" ? "#f59e0b" :
                    THEME.textDim
                  }>
                    {p.weight}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* ── Engine Score Breakdown ────────────────────────────────── */}
      <Card>
        <SectionTitle>Engine Score Breakdown</SectionTitle>
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap:                 "10px",
        }}>
          {[
            {
              label: "Rule Engine",
              value: engineScores?.rules,
              desc:  "Pattern matching",
              color: "#3b82f6",
            },
            {
              label: "LR",
              value: engineScores?.lr,
              desc:  "Logistic Regression",
              color: "#8b5cf6",
            },
            {
              label: "Naive Bayes",
              value: engineScores?.nb,
              desc:  "Probabilistic",
              color: "#06b6d4",
            },
            {
              label: "Random Forest",
              value: engineScores?.rf,
              desc:  "Ensemble trees",
              color: "#f59e0b",
            },
            {
              label: "SVM",
              value: engineScores?.svm,
              desc:  "Support vector",
              color: "#ec4899",
            },
            {
              label: "DistilBERT",
              value: engineScores?.bert,
              desc:  "Transformer",
              color: "#10b981",
            },
            {
              label: "Combined",
              value: engineScores?.combined,
              desc:  "Final score",
              color: engineScores?.combined >= 45 ? "#ef4444" :
                     engineScores?.combined >= 25 ? "#f59e0b" : "#10b981",
            },
          ].map(({ label, value, desc, color }) => (
            <div key={label} style={{
              background:   "rgba(255,255,255,0.02)",
              border:       `1px solid ${THEME.border}`,
              borderRadius: "7px",
              padding:      "12px",
              textAlign:    "center",
              transition:   "border-color 0.15s",
            }}>
              <div style={{
                fontSize:      "9px",
                letterSpacing: "0.1em",
                color:         THEME.textDim,
                marginBottom:  "6px",
              }}>
                {label.toUpperCase()}
              </div>
              <div style={{
                fontSize:   "24px",
                fontWeight: 600,
                color:      value != null ? color : THEME.textFaint,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}>
                {value != null ? value : "—"}
              </div>
              {value != null && (
                <div style={{
                  height:       "2px",
                  background:   THEME.border,
                  borderRadius: "1px",
                  margin:       "8px 0 6px",
                  overflow:     "hidden",
                }}>
                  <div style={{
                    height:     "100%",
                    width:      `${value}%`,
                    background: color,
                    borderRadius: "1px",
                    transition: "width 0.8s ease",
                    boxShadow:  `0 0 6px ${color}`,
                  }} />
                </div>
              )}
              <div style={{
                fontSize:   "10px",
                color:      THEME.textFaint,
                fontFamily: "var(--font-sans, sans-serif)",
                lineHeight: 1.4,
              }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Scam Patterns ─────────────────────────────────────────── */}
      {scamPatterns?.length > 0 && (
        <Card>
          <SectionTitle accent="#f59e0b">
            Matched Scam Patterns
          </SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {scamPatterns.map((p, i) => (
              <Badge key={i} color="#f59e0b" style={{
                fontSize: "11px",
                padding:  "4px 12px",
              }}>
                {p}
              </Badge>
            ))}
          </div>
          <p style={{
            fontSize:   "11px",
            color:      THEME.textFaint,
            margin:     "10px 0 0",
            fontFamily: "var(--font-sans, sans-serif)",
            lineHeight: 1.6,
          }}>
            Patterns matched against known employment fraud taxonomy.
          </p>
        </Card>
      )}
    </div>
  );
}