// src/components/tabs/ReportTab.jsx
// A clean, print-ready forensic report assembling all analysis
// results into a single scrollable document.
// Sections:
//   1. Report header (metadata, risk level, action)
//   2. Executive summary
//   3. Detailed findings (all red flags)
//   4. Positive signals
//   5. ML model performance summary
//   6. Conclusion

import { Card, Badge, SectionTitle }             from "../ui";
import { THEME, SEVERITY_COLOR, RISK_CONFIG }    from "../../constants/config";

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{
      height:     "1px",
      background: THEME.borderLight,
      margin:     "20px 0",
    }} />
  );
}

// ─── Metadata row ─────────────────────────────────────────────────────────────

function MetaRow({ label, value, valueColor }) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      padding:        "7px 0",
      borderBottom:   `1px solid ${THEME.borderLight}`,
    }}>
      <span style={{
        fontSize:      "10px",
        letterSpacing: "0.12em",
        color:         THEME.textDim,
      }}>
        {label.toUpperCase()}
      </span>
      <span style={{
        fontSize:   "12px",
        color:      valueColor || THEME.textMuted,
        fontWeight: valueColor ? 700 : 400,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Finding block ────────────────────────────────────────────────────────────
// One per red flag — numbered, with all detail inline (no accordion needed
// in the report view since this is meant to be read top to bottom).

function FindingBlock({ flag, index }) {
  const sevColor = SEVERITY_COLOR[flag.severity];
  const catColors = {
    Financial:  "#ef4444",
    Identity:   "#f97316",
    Legitimacy: "#f59e0b",
    Language:   "#94a3b8",
    Process:    "#a78bfa",
    Contact:    "#38bdf8",
  };
  const catColor = catColors[flag.category] || THEME.accent;

  return (
    <div style={{
      borderLeft:   `3px solid ${sevColor}`,
      paddingLeft:  "16px",
      marginBottom: "24px",
    }}>
      {/* Finding header */}
      <div style={{
        display:     "flex",
        alignItems:  "center",
        gap:         "10px",
        marginBottom:"10px",
        flexWrap:    "wrap",
      }}>
        <span style={{
          fontSize:      "10px",
          color:         THEME.textFaint,
          fontWeight:    700,
          letterSpacing: "0.1em",
        }}>
          FINDING {String(index + 1).padStart(2, "0")}
        </span>
        <span style={{
          fontSize:   "13px",
          fontWeight: 700,
          color:      THEME.textPrimary,
        }}>
          {flag.title}
        </span>
        <Badge color={sevColor}>{flag.severity}</Badge>
        <Badge color={catColor}>{flag.category}</Badge>
        <Badge color={THEME.textDim}>+{flag.points} pts</Badge>
      </div>

      {/* Evidence */}
      <div style={{
        background:   THEME.bg,
        border:       `1px solid ${THEME.border}`,
        borderLeft:   `3px solid ${sevColor}55`,
        borderRadius: "4px",
        padding:      "10px 14px",
        marginBottom: "10px",
      }}>
        <div style={{
          fontSize:      "9px",
          letterSpacing: "0.14em",
          color:         THEME.textDim,
          marginBottom:  "5px",
        }}>
          EVIDENCE
        </div>
        <div style={{
          fontSize:   "12px",
          color:      sevColor,
          fontStyle:  "italic",
          lineHeight: 1.6,
        }}>
          {flag.evidence}
        </div>
      </div>

      {/* Analysis */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{
          fontSize:      "9px",
          letterSpacing: "0.14em",
          color:         THEME.textDim,
          marginBottom:  "5px",
        }}>
          ANALYSIS
        </div>
        <p style={{
          fontSize:   "12px",
          color:      THEME.textMuted,
          lineHeight: "1.8",
          margin:     0,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {flag.explanation}
        </p>
      </div>

      {/* Benchmark */}
      <div style={{
        background:   "#052010",
        border:       "1px solid #0a4020",
        borderRadius: "4px",
        padding:      "10px 14px",
      }}>
        <div style={{
          fontSize:      "9px",
          letterSpacing: "0.14em",
          color:         "#0a6030",
          marginBottom:  "4px",
        }}>
          ✓ INDUSTRY BENCHMARK
        </div>
        <div style={{
          fontSize:   "12px",
          color:      "#3a8050",
          lineHeight: 1.6,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {flag.industryBenchmark}
        </div>
      </div>
    </div>
  );
}

// ─── Print button ─────────────────────────────────────────────────────────────

function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding:       "10px 20px",
        fontSize:      "11px",
        letterSpacing: "0.12em",
        background:    "transparent",
        border:        `1px solid ${THEME.accent}`,
        color:         THEME.accent,
        cursor:        "pointer",
        borderRadius:  "4px",
        fontFamily:    "inherit",
        display:       "flex",
        alignItems:    "center",
        gap:           "6px",
      }}
    >
      ⎙ PRINT / EXPORT PDF
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReportTab({ result }) {
  const {
    score,
    riskLevel,
    verdict,
    executiveSummary,
    recommendedAction,
    redFlags,
    positives,
    modelPerformance,
    scamPatterns,
    analyzedAt,
    wordCount,
    charCount,
    totalRulesChecked,
    totalRulesFired,
    engineScores,
  } = result;

  const rc  = RISK_CONFIG[riskLevel];
  const mp  = modelPerformance;

  // Format the analysis timestamp
  const formattedDate = new Date(analyzedAt).toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });

  // Severity counts
  const highCount   = redFlags.filter(f => f.severity === "HIGH").length;
  const mediumCount = redFlags.filter(f => f.severity === "MEDIUM").length;
  const lowCount    = redFlags.filter(f => f.severity === "LOW").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

      {/* ── Print action bar ──────────────────────────────────────────── */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   "16px",
      }}>
        <span style={{
          fontSize:      "10px",
          letterSpacing: "0.12em",
          color:         THEME.textDim,
        }}>
          FULL FORENSIC REPORT
        </span>
        <PrintButton />
      </div>

      <Card>

        {/* ══ SECTION 1: Report Header ══════════════════════════════════ */}
        <SectionTitle accent={rc.color}>
          Scam Detection Forensic Report
        </SectionTitle>

        {/* Risk banner inside report */}
        <div style={{
          background:   rc.bg,
          border:       `1px solid ${rc.border}`,
          borderRadius: "6px",
          padding:      "16px 20px",
          marginBottom: "20px",
          display:      "flex",
          alignItems:   "center",
          gap:          "20px",
          flexWrap:     "wrap",
        }}>
          <div style={{ textAlign: "center", minWidth: "60px" }}>
            <div style={{
              fontSize:   "38px",
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
              letterSpacing: "0.1em",
            }}>
              SCAM SCORE
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "160px" }}>
            <Badge color={rc.color} style={{ marginBottom: "8px" }}>
              {rc.label}
            </Badge>
            <div style={{
              fontSize:   "13px",
              color:      THEME.textPrimary,
              lineHeight: 1.5,
              fontFamily: "'IBM Plex Sans', sans-serif",
              marginTop:  "6px",
            }}>
              {verdict}
            </div>
          </div>
          <Badge color={
            recommendedAction === "AVOID"
              ? "#ef4444"
              : recommendedAction === "PROCEED WITH CAUTION"
                ? "#f59e0b"
                : "#22c55e"
          }>
            {recommendedAction}
          </Badge>
        </div>

        {/* Metadata grid */}
        <MetaRow label="Analysis Date"      value={formattedDate}                    />
        <MetaRow label="Risk Level"         value={riskLevel}    valueColor={rc.color} />
        <MetaRow label="Scam Score"         value={`${score} / 100`}                 />
        <MetaRow label="Red Flags Detected" value={`${redFlags.length} (${highCount} HIGH, ${mediumCount} MEDIUM, ${lowCount} LOW)`} />
        <MetaRow label="Positive Signals"   value={positives.length}                 />
        <MetaRow label="Rules Checked"      value={`${totalRulesFired} / ${totalRulesChecked} triggered`} />
        <MetaRow label="Posting Length"     value={`${wordCount} words, ${charCount} characters`} />
        <MetaRow label="Recommended Action" value={recommendedAction}
          valueColor={
            recommendedAction === "AVOID"
              ? "#ef4444"
              : recommendedAction === "PROCEED WITH CAUTION"
                ? "#f59e0b" : "#22c55e"
          }
        />

        <Divider />

        {/* ══ SECTION 2: Executive Summary ═════════════════════════════ */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.14em",
          color:         THEME.textDim,
          marginBottom:  "10px",
        }}>
          EXECUTIVE SUMMARY
        </div>
        <p style={{
          fontSize:   "13px",
          color:      THEME.textMuted,
          lineHeight: "1.9",
          margin:     "0 0 4px",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {executiveSummary}
        </p>

        <Divider />

        {/* ══ SECTION 3: Detailed Findings ═════════════════════════════ */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.14em",
          color:         THEME.textDim,
          marginBottom:  "18px",
        }}>
          DETAILED FINDINGS ({redFlags.length})
        </div>

        {redFlags.length === 0 ? (
          <div style={{
            fontSize:   "13px",
            color:      "#22c55e",
            fontFamily: "'IBM Plex Sans', sans-serif",
            padding:    "12px 0",
          }}>
            No red flags detected — posting appears legitimate.
          </div>
        ) : (
          redFlags.map((flag, i) => (
            <FindingBlock key={flag.id} flag={flag} index={i} />
          ))
        )}

        <Divider />

        {/* ══ SECTION 4: Positive Signals ══════════════════════════════ */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.14em",
          color:         THEME.textDim,
          marginBottom:  "12px",
        }}>
          POSITIVE LEGITIMACY SIGNALS ({positives.length})
        </div>

        {positives.length === 0 ? (
          <p style={{
            fontSize:   "12px",
            color:      THEME.textDim,
            fontFamily: "'IBM Plex Sans', sans-serif",
            margin:     "0 0 4px",
          }}>
            No positive signals detected.
          </p>
        ) : (
          <div style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "8px",
            marginBottom:  "4px",
          }}>
            {positives.map((p, i) => (
              <div key={i} style={{
                display:    "flex",
                gap:        "10px",
                alignItems: "flex-start",
              }}>
                <span style={{
                  color:     "#22c55e",
                  fontSize:  "11px",
                  marginTop: "2px",
                  flexShrink: 0,
                }}>
                  ▸
                </span>
                <div style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        "8px",
                  flexWrap:   "wrap",
                }}>
                  <span style={{
                    fontSize:   "12px",
                    color:      THEME.textMuted,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}>
                    {p.signal}
                  </span>
                  <Badge color={
                    p.weight === "STRONG"   ? "#22c55e" :
                    p.weight === "MODERATE" ? "#f59e0b" :
                    THEME.textDim
                  }>
                    {p.weight}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <Divider />

        {/* ══ SECTION 5: ML Model Performance ══════════════════════════ */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.14em",
          color:         THEME.textDim,
          marginBottom:  "14px",
        }}>
          ML MODEL PERFORMANCE SUMMARY
        </div>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap:                 "10px",
          marginBottom:        "14px",
        }}>
          {[
            { label: "Precision",      value: mp?.precision,    color: "#ef4444" },
            { label: "Recall",         value: mp?.recall,       color: "#f97316" },
            { label: "F1 Score",       value: mp?.f1Score,      color: "#a78bfa" },
            { label: "Accuracy",       value: mp?.accuracy ?? mp?.trainAccuracy, color: "#22c55e" },
            { label: "Rule Score",     value: engineScores.rules,       color: "#4a90d9", raw: true },
            { label: "TF.js Score",    value: engineScores.tfAvailable
                ? engineScores.tensorflow : null,               color: "#a78bfa", raw: true },
          ].map(({ label, value, color, raw }) => (
            <div key={label} style={{
              background:   THEME.bg,
              border:       `1px solid ${THEME.border}`,
              borderRadius: "5px",
              padding:      "12px",
              textAlign:    "center",
            }}>
              <div style={{
                fontSize:   "20px",
                fontWeight: 700,
                color:      value !== null && value !== undefined ? color : THEME.textFaint,
                lineHeight: 1,
              }}>
                {value !== null && value !== undefined
                  ? raw
                    ? value
                    : `${Math.round(value * 100)}%`
                  : "—"
                }
              </div>
              <div style={{
                fontSize:      "9px",
                color:         THEME.textFaint,
                marginTop:     "5px",
                letterSpacing: "0.08em",
              }}>
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Scam patterns */}
        {scamPatterns.length > 0 && (
          <>
            <div style={{
              fontSize:      "10px",
              letterSpacing: "0.12em",
              color:         THEME.textDim,
              marginBottom:  "8px",
            }}>
              MATCHED SCAM PATTERNS
            </div>
            <div style={{
              display:      "flex",
              flexWrap:     "wrap",
              gap:          "6px",
              marginBottom: "4px",
            }}>
              {scamPatterns.map((p, i) => (
                <Badge key={i} color="#f59e0b">{p}</Badge>
              ))}
            </div>
          </>
        )}

        <Divider />

        {/* ══ SECTION 6: Conclusion ═════════════════════════════════════ */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.14em",
          color:         THEME.textDim,
          marginBottom:  "12px",
        }}>
          CONCLUSION
        </div>

        <div style={{
          background:   rc.bg,
          border:       `1px solid ${rc.border}`,
          borderRadius: "5px",
          padding:      "14px 18px",
          marginBottom: "16px",
        }}>
          <div style={{
            fontSize:   "12px",
            color:      rc.color,
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.7,
          }}>
            <strong>Recommended Action: {recommendedAction}</strong>
            <br />
            {verdict}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          fontSize:   "10px",
          color:      THEME.textFaint,
          fontFamily: "'IBM Plex Sans', sans-serif",
          lineHeight: 1.7,
          borderTop:  `1px solid ${THEME.borderLight}`,
          paddingTop: "14px",
        }}>
          This report was generated automatically by the ScamDetect ML system 
          using a hybrid rule-based and TensorFlow.js neural network classifier. 
          Results are indicative and should be used as a decision-support tool 
          alongside independent verification. The system evaluated {totalRulesChecked} rule 
          patterns and a {mp?.vocabSize ?? "—"}-token vocabulary neural network 
          trained on {mp?.datasetStats?.total ?? "—"} labeled job postings.
        </div>

      </Card>
    </div>
  );
}