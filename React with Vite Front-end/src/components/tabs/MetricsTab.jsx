// src/components/tabs/MetricsTab.jsx
import { Card, Badge, SectionTitle }              from "../ui";
import { THEME, FLAG_CATEGORIES, SEVERITY_COLOR } from "../../constants/config";

const MODEL_COLORS = {
  lr:   "#8b5cf6",
  nb:   "#06b6d4",
  rf:   "#f59e0b",
  svm:  "#ec4899",
  bert: "#10b981",
};

const MODEL_LABELS = {
  lr:   "Logistic Regression",
  nb:   "Naive Bayes",
  rf:   "Random Forest",
  svm:  "SVM",
  bert: "DistilBERT",
};

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, description, color, format = "percent" }) {
  const display = value == null ? "—"
    : format === "percent" ? `${Math.round(value * 100)}%`
    : format === "score"   ? `${value}`
    : value;

  const barWidth = value == null ? 0
    : format === "percent" ? Math.round(value * 100)
    : format === "score"   ? value : 0;

  return (
    <div style={{
      background:   "rgba(255,255,255,0.02)",
      border:       `1px solid ${THEME.border}`,
      borderRadius: "7px",
      padding:      "14px",
      transition:   "border-color 0.15s",
    }}>
      <div style={{
        fontSize:      "9px",
        letterSpacing: "0.12em",
        color:         THEME.textFaint,
        marginBottom:  "8px",
      }}>
        {label.toUpperCase()}
      </div>
      <div style={{
        fontSize:   "28px",
        fontWeight: 600,
        color:      value == null ? THEME.textFaint : color,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}>
        {display}
      </div>
      <div style={{
        height:       "2px",
        background:   THEME.border,
        borderRadius: "1px",
        margin:       "10px 0 8px",
        overflow:     "hidden",
      }}>
        <div style={{
          height:       "100%",
          width:        `${barWidth}%`,
          background:   value == null ? THEME.border : color,
          borderRadius: "1px",
          transition:   "width 0.8s ease",
          boxShadow:    value != null ? `0 0 6px ${color}80` : "none",
        }} />
      </div>
      <div style={{
        fontSize:   "10px",
        color:      THEME.textFaint,
        lineHeight: 1.5,
        fontFamily: "var(--font-sans, sans-serif)",
      }}>
        {description}
      </div>
    </div>
  );
}

// ── Per-model row ─────────────────────────────────────────────────────────────

function ModelRow({ modelKey, metrics, prob, time, score }) {
  const color = MODEL_COLORS[modelKey] || THEME.accent;
  const label = MODEL_LABELS[modelKey] || modelKey;
  const pct   = prob != null ? Math.round(prob * 100) : null;

  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          "12px",
      padding:      "12px 0",
      borderBottom: `1px solid ${THEME.borderLight}`,
    }}>
      {/* Color dot + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "160px" }}>
        <div style={{
          width:        "8px",
          height:       "8px",
          borderRadius: "50%",
          background:   color,
          boxShadow:    `0 0 6px ${color}`,
          flexShrink:   0,
        }} />
        <span style={{ fontSize: "12px", color: THEME.textMuted }}>{label}</span>
      </div>

      {/* Score bar */}
      <div style={{ flex: 1 }}>
        <div style={{
          height:       "4px",
          background:   THEME.border,
          borderRadius: "2px",
          overflow:     "hidden",
        }}>
          <div style={{
            height:       "100%",
            width:        score != null ? `${score}%` : "0%",
            background:   color,
            borderRadius: "2px",
            transition:   "width 0.8s ease",
            boxShadow:    `0 0 6px ${color}60`,
          }} />
        </div>
      </div>

      {/* Score value */}
      <div style={{
        minWidth:   "40px",
        textAlign:  "right",
        fontSize:   "13px",
        fontWeight: 600,
        color:      score != null ? color : THEME.textFaint,
        fontVariantNumeric: "tabular-nums",
      }}>
        {score != null ? score : "—"}
      </div>

      {/* Metrics */}
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        {metrics && (
          <>
            <Badge color={color}>F1 {Math.round(metrics.f1 * 100)}%</Badge>
            <Badge color={color}>Acc {Math.round(metrics.accuracy * 100)}%</Badge>
          </>
        )}
        {time != null && (
          <span style={{ fontSize: "10px", color: THEME.textFaint }}>
            {time}ms
          </span>
        )}
      </div>
    </div>
  );
}

// ── Confusion matrix ──────────────────────────────────────────────────────────

function ConfusionMatrix({ matrix }) {
  if (!matrix) return null;
  const { tp, fp, fn, tn } = matrix;
  const total = tp + fp + fn + tn;

  const cells = [
    { label: "True Positive",  value: tp, color: "#10b981", desc: "Scam correctly identified"     },
    { label: "False Positive", value: fp, color: "#f59e0b", desc: "Legit wrongly flagged"          },
    { label: "False Negative", value: fn, color: "#f97316", desc: "Scam missed by model"           },
    { label: "True Negative",  value: tn, color: "#3b82f6", desc: "Legit correctly cleared"        },
  ];

  return (
    <Card>
      <SectionTitle accent="#8b5cf6">Confusion Matrix</SectionTitle>
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "8px",
        marginBottom:        "14px",
      }}>
        {cells.map(({ label, value, color, desc }) => (
          <div key={label} style={{
            background:   `${color}08`,
            border:       `1px solid ${color}25`,
            borderRadius: "7px",
            padding:      "14px",
            textAlign:    "center",
          }}>
            <div style={{
              fontSize:   "26px",
              fontWeight: 600,
              color,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}>
              {value}
            </div>
            <div style={{
              fontSize:      "9px",
              color,
              letterSpacing: "0.08em",
              margin:        "4px 0",
              fontWeight:    500,
            }}>
              {label.toUpperCase()}
            </div>
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
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        fontSize:       "10px",
        color:          THEME.textDim,
        letterSpacing:  "0.08em",
        borderTop:      `1px solid ${THEME.borderLight}`,
        paddingTop:     "10px",
      }}>
        <span>TOTAL: {total} samples</span>
        <span>CORRECT: {tp + tn} ({total > 0 ? Math.round(((tp+tn)/total)*100) : 0}%)</span>
      </div>
    </Card>
  );
}

// ── Category breakdown ────────────────────────────────────────────────────────

function CategoryBreakdown({ breakdown, total }) {
  const CATEGORY_COLOR = {
    Financial:  "#ef4444",
    Identity:   "#f97316",
    Legitimacy: "#f59e0b",
    Language:   "#94a3b8",
    Process:    "#8b5cf6",
    Contact:    "#06b6d4",
  };

  return (
    <Card>
      <SectionTitle>Signal Category Breakdown</SectionTitle>
      {FLAG_CATEGORIES.map(cat => {
        const count = breakdown?.[cat] || 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        const color = CATEGORY_COLOR[cat] || THEME.accent;
        return (
          <div key={cat} style={{
            display:     "flex",
            alignItems:  "center",
            gap:         "12px",
            marginBottom:"10px",
          }}>
            <div style={{
              width:         "90px",
              fontSize:      "10px",
              color:         count > 0 ? color : THEME.textFaint,
              textAlign:     "right",
              flexShrink:    0,
              letterSpacing: "0.04em",
            }}>
              {cat}
            </div>
            <div style={{
              flex:         1,
              height:       "4px",
              background:   THEME.border,
              borderRadius: "2px",
              overflow:     "hidden",
            }}>
              <div style={{
                height:       "100%",
                width:        `${pct}%`,
                background:   count > 0 ? color : THEME.border,
                borderRadius: "2px",
                transition:   "width 0.6s ease",
                boxShadow:    count > 0 ? `0 0 6px ${color}60` : "none",
              }} />
            </div>
            <div style={{
              width:      "20px",
              fontSize:   "11px",
              fontWeight: count > 0 ? 600 : 400,
              color:      count > 0 ? color : THEME.textFaint,
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
            }}>
              {count}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MetricsTab({ result }) {
  const { modelPerformance: mp, categoryBreakdown, redFlags, engineScores } = result;

  if (!mp) {
    return (
      <Card>
        <div style={{
          textAlign:  "center",
          padding:    "40px",
          color:      THEME.textDim,
          fontSize:   "13px",
          fontFamily: "var(--font-sans, sans-serif)",
        }}>
          No metrics available yet.
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Header note ───────────────────────────────────────────── */}
      <Card>
        <SectionTitle>Model Performance — Classification Report</SectionTitle>
        <p style={{
          fontSize:   "12px",
          color:      THEME.textDim,
          margin:     "0 0 18px",
          fontFamily: "var(--font-sans, sans-serif)",
          lineHeight: 1.6,
        }}>
          Metrics computed by evaluating all models against the labeled training
          dataset. Hardware tier: <Badge color={THEME.accent}>{mp.hardwareTier || "LOW"}</Badge>
          {mp.totalTimeMs && (
            <span style={{ marginLeft: "8px" }}>
              Total analysis time: <Badge color="#10b981">{mp.totalTimeMs}ms</Badge>
            </span>
          )}
        </p>

        {/* Summary metric cards */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
          gap:                 "10px",
        }}>
          <MetricCard
            label="Confidence"
            value={mp.confidence}
            description="Model certainty for this prediction"
            color="#3b82f6"
          />
          <MetricCard
            label="Signal Density"
            value={mp.signalDensity}
            description="Fraction of rules fired"
            color="#f59e0b"
          />
          <MetricCard
            label="Features Analyzed"
            value={mp.featuresAnalyzed}
            description="Total rules checked"
            color="#8b5cf6"
            format="raw"
          />
          <MetricCard
            label="Flags Found"
            value={mp.featuresFired}
            description="Rules that fired"
            color="#ef4444"
            format="raw"
          />
        </div>
      </Card>

      {/* ── Per-model breakdown ───────────────────────────────────── */}
      <Card>
        <SectionTitle accent="#8b5cf6">Per-Model Scores & Metrics</SectionTitle>
        <div>
          {[
            { key: "lr",   metrics: mp.lr,  prob: mp.lrProb,   time: mp.lrTime,   score: engineScores?.lr   },
            { key: "nb",   metrics: mp.nb,  prob: mp.nbProb,   time: mp.nbTime,   score: engineScores?.nb   },
            { key: "rf",   metrics: mp.rf,  prob: mp.rfProb,   time: mp.rfTime,   score: engineScores?.rf   },
            { key: "svm",  metrics: mp.svm, prob: mp.svmProb,  time: mp.svmTime,  score: engineScores?.svm  },
            { key: "bert", metrics: null,   prob: mp.bertProb, time: mp.bertTime, score: engineScores?.bert },
          ].map(({ key, metrics, prob, time, score }) => (
            <ModelRow
              key={key}
              modelKey={key}
              metrics={metrics}
              prob={prob}
              time={time ? Math.round(time) : null}
              score={score}
            />
          ))}
        </div>

        {/* Ensemble */}
        <div style={{
          marginTop:    "12px",
          padding:      "12px",
          background:   "rgba(59,130,246,0.05)",
          border:       "1px solid rgba(59,130,246,0.15)",
          borderRadius: "6px",
          display:      "flex",
          justifyContent: "space-between",
          alignItems:   "center",
        }}>
          <div>
            <div style={{
              fontSize:      "10px",
              letterSpacing: "0.1em",
              color:         THEME.textDim,
              marginBottom:  "2px",
            }}>
              ENSEMBLE FINAL
            </div>
            <div style={{
              fontSize:   "11px",
              color:      THEME.textMuted,
              fontFamily: "var(--font-sans, sans-serif)",
            }}>
              {mp.bertProb != null
                ? "BERT(40%) + LR(15%) + NB(15%) + RF(15%) + SVM(15%)"
                : "LR(25%) + NB(25%) + RF(25%) + SVM(25%) — BERT unavailable"}
            </div>
          </div>
          <div style={{
            fontSize:   "28px",
            fontWeight: 700,
            color:      "#3b82f6",
            fontVariantNumeric: "tabular-nums",
          }}>
            {engineScores?.ensemble ?? "—"}
          </div>
        </div>
      </Card>

      {/* ── Sklearn eval metrics ──────────────────────────────────── */}
      {(mp.lr || mp.nb || mp.rf || mp.svm) && (
        <Card>
          <SectionTitle>Training Evaluation Metrics</SectionTitle>
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
            gap:                 "10px",
          }}>
            {["lr","nb","rf","svm"].map(key => {
              const m     = mp[key];
              const color = MODEL_COLORS[key];
              if (!m) return null;
              return (
                <div key={key} style={{
                  background:   "rgba(255,255,255,0.02)",
                  border:       `1px solid ${color}25`,
                  borderRadius: "7px",
                  padding:      "14px",
                }}>
                  <div style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    marginBottom:   "10px",
                  }}>
                    <span style={{
                      fontSize:   "11px",
                      fontWeight: 500,
                      color:      THEME.textPrimary,
                    }}>
                      {MODEL_LABELS[key]}
                    </span>
                    <Badge color={color}>
                      F1 {Math.round(m.f1 * 100)}%
                    </Badge>
                  </div>
                  {[
                    ["Precision", m.precision],
                    ["Recall",    m.recall],
                    ["Accuracy",  m.accuracy],
                  ].map(([label, val]) => (
                    <div key={label} style={{
                      display:        "flex",
                      justifyContent: "space-between",
                      alignItems:     "center",
                      marginBottom:   "6px",
                    }}>
                      <span style={{ fontSize: "10px", color: THEME.textDim }}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width:        "60px",
                          height:       "3px",
                          background:   THEME.border,
                          borderRadius: "2px",
                          overflow:     "hidden",
                        }}>
                          <div style={{
                            height:     "100%",
                            width:      `${Math.round(val*100)}%`,
                            background: color,
                            borderRadius: "2px",
                          }} />
                        </div>
                        <span style={{
                          fontSize:   "11px",
                          fontWeight: 500,
                          color,
                          minWidth:   "32px",
                          textAlign:  "right",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {Math.round(val * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Confusion matrix ──────────────────────────────────────── */}
      {mp.lr?.confusion && (
        <ConfusionMatrix matrix={{
          tp: mp.lr.confusion[1]?.[1] ?? 0,
          fp: mp.lr.confusion[0]?.[1] ?? 0,
          fn: mp.lr.confusion[1]?.[0] ?? 0,
          tn: mp.lr.confusion[0]?.[0] ?? 0,
        }} />
      )}

      {/* ── Category breakdown ────────────────────────────────────── */}
      <CategoryBreakdown
        breakdown={categoryBreakdown}
        total={redFlags?.length || 0}
      />

      {/* ── Dataset info ──────────────────────────────────────────── */}
      {mp.datasetStats && (
        <Card>
          <SectionTitle accent="#06b6d4">Dataset & Hardware Info</SectionTitle>
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
            gap:                 "10px",
          }}>
            {[
              { label: "Total Samples",  value: mp.datasetStats.total,      color: THEME.accent  },
              { label: "Scam Examples",  value: mp.datasetStats.scamCount,  color: "#ef4444"     },
              { label: "Legit Examples", value: mp.datasetStats.legitCount, color: "#10b981"     },
              { label: "Hardware Tier",  value: mp.hardwareTier || "LOW",   color: "#f59e0b", raw: true },
            ].map(({ label, value, color, raw }) => (
              <div key={label} style={{
                background:   "rgba(255,255,255,0.02)",
                border:       `1px solid ${THEME.border}`,
                borderRadius: "6px",
                padding:      "12px",
                textAlign:    "center",
              }}>
                <div style={{
                  fontSize:   raw ? "16px" : "22px",
                  fontWeight: 600,
                  color,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {value}
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
        </Card>
      )}
    </div>
  );
}