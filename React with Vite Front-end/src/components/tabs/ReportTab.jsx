// src/components/tabs/ReportTab.jsx
import { Card, Badge, SectionTitle }          from "../ui";
import { THEME, SEVERITY_COLOR, RISK_CONFIG } from "../../constants/config";

function Divider() {
  return (
    <div style={{
      height:     "1px",
      background: THEME.borderLight,
      margin:     "20px 0",
    }} />
  );
}

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
        letterSpacing: "0.1em",
        color:         THEME.textDim,
      }}>
        {label.toUpperCase()}
      </span>
      <span style={{
        fontSize:   "12px",
        color:      valueColor || THEME.textMuted,
        fontWeight: valueColor ? 600 : 400,
        fontFamily: "var(--font-sans, sans-serif)",
      }}>
        {value}
      </span>
    </div>
  );
}

function FindingBlock({ flag, index }) {
  const sevColor = SEVERITY_COLOR[flag.severity];
  const catColors = {
    Financial:  "#ef4444",
    Identity:   "#f97316",
    Legitimacy: "#f59e0b",
    Language:   "#94a3b8",
    Process:    "#8b5cf6",
    Contact:    "#06b6d4",
  };
  const catColor = catColors[flag.category] || THEME.accent;

  return (
    <div style={{
      borderLeft:   `2px solid ${sevColor}`,
      paddingLeft:  "16px",
      marginBottom: "24px",
    }}>
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
          fontWeight:    600,
          letterSpacing: "0.1em",
          fontVariantNumeric: "tabular-nums",
        }}>
          FINDING {String(index + 1).padStart(2, "0")}
        </span>
        <span style={{
          fontSize:   "13px",
          fontWeight: 500,
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
        background:   "rgba(255,255,255,0.02)",
        border:       `1px solid ${THEME.border}`,
        borderLeft:   `2px solid ${sevColor}40`,
        borderRadius: "5px",
        padding:      "10px 14px",
        marginBottom: "10px",
      }}>
        <div style={{
          fontSize:      "9px",
          letterSpacing: "0.12em",
          color:         THEME.textFaint,
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
          letterSpacing: "0.12em",
          color:         THEME.textFaint,
          marginBottom:  "5px",
        }}>
          ANALYSIS
        </div>
        <p style={{
          fontSize:   "12px",
          color:      THEME.textMuted,
          lineHeight: "1.8",
          margin:     0,
          fontFamily: "var(--font-sans, sans-serif)",
        }}>
          {flag.explanation}
        </p>
      </div>

      {/* Benchmark */}
      <div style={{
        background:   "rgba(16,185,129,0.05)",
        border:       "1px solid rgba(16,185,129,0.15)",
        borderRadius: "5px",
        padding:      "10px 14px",
      }}>
        <div style={{
          fontSize:      "9px",
          letterSpacing: "0.12em",
          color:         "rgba(16,185,129,0.5)",
          marginBottom:  "4px",
        }}>
          ✓ INDUSTRY BENCHMARK
        </div>
        <div style={{
          fontSize:   "12px",
          color:      "#10b981",
          lineHeight: 1.6,
          fontFamily: "var(--font-sans, sans-serif)",
        }}>
          {flag.industryBenchmark}
        </div>
      </div>
    </div>
  );
}

export default function ReportTab({ result }) {
  const {
    score,
    riskLevel,
    verdict,
    executiveSummary,
    recommendedAction,
    redFlags,
    positives,
    modelPerformance: mp,
    scamPatterns,
    analyzedAt,
    wordCount,
    charCount,
    totalRulesChecked,
    totalRulesFired,
    engineScores,
  } = result;

  const rc  = RISK_CONFIG[riskLevel];

  const formattedDate = new Date(analyzedAt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const highCount   = redFlags.filter(f => f.severity === "HIGH").length;
  const mediumCount = redFlags.filter(f => f.severity === "MEDIUM").length;
  const lowCount    = redFlags.filter(f => f.severity === "LOW").length;

  const actionColor =
    recommendedAction === "AVOID" ? "#ef4444" :
    recommendedAction === "PROCEED WITH CAUTION" ? "#f59e0b" : "#10b981";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

      {/* Print bar */}
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
        <button
          onClick={() => window.print()}
          style={{
            padding:       "8px 18px",
            fontSize:      "10px",
            letterSpacing: "0.1em",
            background:    "transparent",
            border:        `1px solid ${THEME.border}`,
            color:         THEME.textMuted,
            cursor:        "pointer",
            borderRadius:  "5px",
            fontFamily:    "inherit",
            transition:    "all 0.15s",
          }}
          onMouseEnter={e => {
            e.target.style.borderColor = THEME.accent;
            e.target.style.color       = THEME.accent;
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = THEME.border;
            e.target.style.color       = THEME.textMuted;
          }}
        >
          ⎙ PRINT / EXPORT PDF
        </button>
      </div>

      <Card>

        {/* Section 1: Header */}
        <SectionTitle accent={rc.color}>
          Scam Detection Forensic Report
        </SectionTitle>

        {/* Risk banner */}
        <div style={{
          background:   rc.bg,
          border:       `1px solid ${rc.border}`,
          borderRadius: "7px",
          padding:      "16px 20px",
          marginBottom: "20px",
          display:      "flex",
          alignItems:   "center",
          gap:          "20px",
          flexWrap:     "wrap",
          boxShadow:    `0 0 20px ${rc.glow}`,
        }}>
          <div style={{ textAlign: "center", minWidth: "60px" }}>
            <div style={{
              fontSize:   "36px",
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
              fontFamily: "var(--font-sans, sans-serif)",
              marginTop:  "6px",
            }}>
              {verdict}
            </div>
          </div>
          <div style={{
            padding:      "6px 14px",
            borderRadius: "5px",
            background:   `${actionColor}12`,
            border:       `1px solid ${actionColor}30`,
            fontSize:     "10px",
            fontWeight:   600,
            color:        actionColor,
            letterSpacing:"0.1em",
          }}>
            {recommendedAction}
          </div>
        </div>

        {/* Metadata */}
        <MetaRow label="Analysis Date"      value={formattedDate} />
        <MetaRow label="Risk Level"         value={riskLevel}     valueColor={rc.color} />
        <MetaRow label="Scam Score"         value={`${score} / 100`} />
        <MetaRow label="Red Flags"          value={`${redFlags.length} (${highCount} HIGH · ${mediumCount} MEDIUM · ${lowCount} LOW)`} />
        <MetaRow label="Positive Signals"   value={positives.length} />
        <MetaRow label="Rules Checked"      value={`${totalRulesFired} / ${totalRulesChecked} triggered`} />
        <MetaRow label="Posting Length"     value={`${wordCount} words · ${charCount} characters`} />
        <MetaRow label="Recommended Action" value={recommendedAction} valueColor={actionColor} />

        <Divider />

        {/* Section 2: Executive Summary */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.12em",
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
          fontFamily: "var(--font-sans, sans-serif)",
        }}>
          {executiveSummary}
        </p>

        <Divider />

        {/* Section 3: Detailed Findings */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.12em",
          color:         THEME.textDim,
          marginBottom:  "18px",
        }}>
          DETAILED FINDINGS ({redFlags.length})
        </div>

        {redFlags.length === 0 ? (
          <div style={{
            fontSize:   "13px",
            color:      "#10b981",
            fontFamily: "var(--font-sans, sans-serif)",
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

        {/* Section 4: Positives */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.12em",
          color:         THEME.textDim,
          marginBottom:  "12px",
        }}>
          POSITIVE LEGITIMACY SIGNALS ({positives.length})
        </div>

        {positives.length === 0 ? (
          <p style={{
            fontSize:   "12px",
            color:      THEME.textDim,
            fontFamily: "var(--font-sans, sans-serif)",
            margin:     "0 0 4px",
          }}>
            No positive signals detected.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "4px" }}>
            {positives.map((p, i) => (
              <div key={i} style={{
                display:    "flex",
                gap:        "10px",
                alignItems: "center",
              }}>
                <span style={{ color: "#10b981", fontSize: "11px", flexShrink: 0 }}>▸</span>
                <span style={{
                  fontSize:   "12px",
                  color:      THEME.textMuted,
                  fontFamily: "var(--font-sans, sans-serif)",
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
            ))}
          </div>
        )}

        <Divider />

        {/* Section 5: ML Performance */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.12em",
          color:         THEME.textDim,
          marginBottom:  "14px",
        }}>
          ML MODEL PERFORMANCE SUMMARY
        </div>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap:                 "10px",
          marginBottom:        "14px",
        }}>
          {[
            { label: "Rule Score",  value: engineScores?.rules,    color: "#3b82f6", raw: true },
            { label: "LR Score",    value: engineScores?.lr,       color: "#8b5cf6", raw: true },
            { label: "NB Score",    value: engineScores?.nb,       color: "#06b6d4", raw: true },
            { label: "RF Score",    value: engineScores?.rf,       color: "#f59e0b", raw: true },
            { label: "SVM Score",   value: engineScores?.svm,      color: "#ec4899", raw: true },
            { label: "BERT Score",  value: engineScores?.bert,     color: "#10b981", raw: true },
            { label: "Ensemble",    value: engineScores?.ensemble, color: "#3b82f6", raw: true },
          ].map(({ label, value, color, raw }) => (
            <div key={label} style={{
              background:   "rgba(255,255,255,0.02)",
              border:       `1px solid ${THEME.border}`,
              borderRadius: "6px",
              padding:      "10px",
              textAlign:    "center",
            }}>
              <div style={{
                fontSize:   "20px",
                fontWeight: 600,
                color:      value != null ? color : THEME.textFaint,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}>
                {value != null ? value : "—"}
              </div>
              <div style={{
                fontSize:      "9px",
                color:         THEME.textFaint,
                marginTop:     "4px",
                letterSpacing: "0.06em",
              }}>
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Scam patterns */}
        {scamPatterns?.length > 0 && (
          <>
            <div style={{
              fontSize:      "10px",
              letterSpacing: "0.1em",
              color:         THEME.textDim,
              marginBottom:  "8px",
            }}>
              MATCHED SCAM PATTERNS
            </div>
            <div style={{
              display:  "flex",
              flexWrap: "wrap",
              gap:      "6px",
              marginBottom: "4px",
            }}>
              {scamPatterns.map((p, i) => (
                <Badge key={i} color="#f59e0b">{p}</Badge>
              ))}
            </div>
          </>
        )}

        <Divider />

        {/* Section 6: Conclusion */}
        <div style={{
          fontSize:      "10px",
          letterSpacing: "0.12em",
          color:         THEME.textDim,
          marginBottom:  "12px",
        }}>
          CONCLUSION
        </div>

        <div style={{
          background:   rc.bg,
          border:       `1px solid ${rc.border}`,
          borderRadius: "6px",
          padding:      "14px 18px",
          marginBottom: "16px",
          boxShadow:    `0 0 16px ${rc.glow}`,
        }}>
          <div style={{
            fontSize:   "12px",
            color:      rc.color,
            fontFamily: "var(--font-sans, sans-serif)",
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
          fontFamily: "var(--font-sans, sans-serif)",
          lineHeight: 1.7,
          borderTop:  `1px solid ${THEME.borderLight}`,
          paddingTop: "14px",
        }}>
          This report was generated automatically by the ScamDetect ML system
          using a hybrid rule-based engine and a 5-model ensemble classifier
          (Logistic Regression, Naive Bayes, Random Forest, SVM, DistilBERT).
          Results are indicative and should be used as a decision-support tool
          alongside independent verification.
          Hardware tier: {mp?.hardwareTier || "LOW"} ·
          Dataset: {mp?.datasetStats?.total ?? "30"} labeled examples ·
          Analysis time: {result.totalTimeMs ?? "—"}ms
        </div>
      </Card>
    </div>
  );
}