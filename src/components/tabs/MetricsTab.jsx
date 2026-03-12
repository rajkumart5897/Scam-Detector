// src/components/tabs/MetricsTab.jsx
// Displays all ML model performance metrics:
//   - Precision, Recall, F1, Accuracy cards
//   - Confusion matrix
//   - Dataset statistics
//   - Category breakdown bar chart
//   - Engine weight visualization
//   - Model architecture summary

import { Card, Badge, SectionTitle }         from "../ui";
import { THEME, FLAG_CATEGORIES, SEVERITY_COLOR } from "../../constants/config";

// ─── Metric card ──────────────────────────────────────────────────────────────
// Reusable card for a single metric value with a progress bar.

function MetricCard({ label, value, description, color, format = "percent" }) {
  const display = value === null
    ? "—"
    : format === "percent"
      ? `${Math.round(value * 100)}%`
      : format === "score"
        ? `${value}/100`
        : value;

  const barWidth = value === null
    ? 0
    : format === "percent"
      ? Math.round(value * 100)
      : format === "score"
        ? value
        : 0;

  return (
    <div style={{
      background:   THEME.bg,
      border:       `1px solid ${THEME.border}`,
      borderRadius: "6px",
      padding:      "16px",
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
        fontSize:   "30px",
        fontWeight: 700,
        color:      value === null ? THEME.textFaint : color,
        lineHeight: 1,
      }}>
        {display}
      </div>

      {/* Progress bar */}
      <div style={{
        height:       "3px",
        background:   THEME.border,
        borderRadius: "2px",
        margin:       "10px 0 8px",
        overflow:     "hidden",
      }}>
        <div style={{
          height:       "100%",
          width:        `${barWidth}%`,
          background:   value === null ? THEME.border : color,
          borderRadius: "2px",
          transition:   "width 0.8s ease",
        }} />
      </div>

      <div style={{
        fontSize:   "10px",
        color:      THEME.textFaint,
        lineHeight: 1.5,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        {description}
      </div>
    </div>
  );
}

// ─── Confusion matrix ─────────────────────────────────────────────────────────

function ConfusionMatrix({ matrix }) {
  if (!matrix) return null;
  const { tp, fp, fn, tn } = matrix;
  const total = tp + fp + fn + tn;

  const cells = [
    { label: "True Positive",  value: tp, color: "#22c55e", desc: "Scam correctly identified"    },
    { label: "False Positive", value: fp, color: "#f59e0b", desc: "Legit wrongly flagged as scam" },
    { label: "False Negative", value: fn, color: "#f97316", desc: "Scam missed by model"          },
    { label: "True Negative",  value: tn, color: "#4a90d9", desc: "Legit correctly cleared"       },
  ];

  return (
    <Card>
      <SectionTitle accent="#a78bfa">Confusion Matrix</SectionTitle>

      {/* 2x2 grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "8px",
        marginBottom:        "16px",
      }}>
        {cells.map(({ label, value, color, desc }) => (
          <div key={label} style={{
            background:   `${color}11`,
            border:       `1px solid ${color}33`,
            borderRadius: "6px",
            padding:      "14px",
            textAlign:    "center",
          }}>
            <div style={{
              fontSize:   "28px",
              fontWeight: 700,
              color,
              lineHeight: 1,
            }}>
              {value}
            </div>
            <div style={{
              fontSize:      "10px",
              color,
              letterSpacing: "0.08em",
              margin:        "4px 0",
            }}>
              {label.toUpperCase()}
            </div>
            <div style={{
              fontSize:   "10px",
              color:      THEME.textFaint,
              fontFamily: "'IBM Plex Sans', sans-serif",
              lineHeight: 1.4,
            }}>
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* Axis labels */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        fontSize:       "10px",
        color:          THEME.textDim,
        letterSpacing:  "0.1em",
        borderTop:      `1px solid ${THEME.border}`,
        paddingTop:     "10px",
      }}>
        <span>TOTAL EVALUATED: {total} samples</span>
        <span>
          CORRECT: {tp + tn} ({total > 0 ? Math.round(((tp + tn) / total) * 100) : 0}%)
        </span>
      </div>
    </Card>
  );
}

// ─── Category breakdown bar chart ─────────────────────────────────────────────

function CategoryBreakdown({ breakdown, redFlagsTotal }) {
  const CATEGORY_COLOR = {
    Financial:  "#ef4444",
    Identity:   "#f97316",
    Legitimacy: "#f59e0b",
    Language:   "#94a3b8",
    Process:    "#a78bfa",
    Contact:    "#38bdf8",
  };

  return (
    <Card>
      <SectionTitle>Signal Category Breakdown</SectionTitle>
      {FLAG_CATEGORIES.map(cat => {
        const count = breakdown?.[cat] || 0;
        const pct   = redFlagsTotal > 0
          ? Math.round((count / redFlagsTotal) * 100)
          : 0;
        const color = CATEGORY_COLOR[cat] || THEME.accent;

        return (
          <div key={cat} style={{
            display:     "flex",
            alignItems:  "center",
            gap:         "12px",
            marginBottom:"10px",
          }}>
            {/* Category label */}
            <div style={{
              width:         "90px",
              fontSize:      "10px",
              color:         count > 0 ? color : THEME.textFaint,
              textAlign:     "right",
              flexShrink:    0,
              letterSpacing: "0.06em",
            }}>
              {cat}
            </div>

            {/* Bar */}
            <div style={{
              flex:         1,
              height:       "6px",
              background:   THEME.border,
              borderRadius: "3px",
              overflow:     "hidden",
            }}>
              <div style={{
                height:       "100%",
                width:        `${pct}%`,
                background:   count > 0 ? color : THEME.border,
                borderRadius: "3px",
                transition:   "width 0.6s ease",
              }} />
            </div>

            {/* Count */}
            <div style={{
              width:      "20px",
              fontSize:   "11px",
              fontWeight: count > 0 ? 700 : 400,
              color:      count > 0 ? color : THEME.textFaint,
              flexShrink: 0,
            }}>
              {count}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ─── Dataset stats ────────────────────────────────────────────────────────────

function DatasetStats({ stats, vocabSize, epochs, architecture }) {
  if (!stats) return null;

  const items = [
    { label: "Total Training Samples", value: stats.total         },
    { label: "Scam Examples",          value: stats.scamCount     },
    { label: "Legitimate Examples",    value: stats.legitCount    },
    { label: "Vocabulary Size",        value: vocabSize ?? "—"    },
    { label: "Training Epochs",        value: epochs    ?? "—"    },
  ];

  return (
    <Card>
      <SectionTitle accent="#38bdf8">Dataset & Training Info</SectionTitle>

      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap:                 "10px",
        marginBottom:        "16px",
      }}>
        {items.map(({ label, value }) => (
          <div key={label} style={{
            background:   THEME.bg,
            border:       `1px solid ${THEME.border}`,
            borderRadius: "5px",
            padding:      "12px",
            textAlign:    "center",
          }}>
            <div style={{
              fontSize:   "22px",
              fontWeight: 700,
              color:      THEME.accent,
              lineHeight: 1,
            }}>
              {value}
            </div>
            <div style={{
              fontSize:      "9px",
              color:         THEME.textFaint,
              marginTop:     "5px",
              letterSpacing: "0.08em",
              lineHeight:    1.4,
            }}>
              {label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Architecture */}
      {architecture && (
        <div style={{
          background:   THEME.bg,
          border:       `1px solid ${THEME.border}`,
          borderRadius: "5px",
          padding:      "12px 16px",
        }}>
          <div style={{
            fontSize:      "9px",
            letterSpacing: "0.12em",
            color:         THEME.textDim,
            marginBottom:  "6px",
          }}>
            MODEL ARCHITECTURE
          </div>
          <div style={{
            fontSize:   "11px",
            color:      "#a78bfa",
            fontFamily: "inherit",
            lineHeight: 1.6,
          }}>
            {architecture}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Engine weight visualization ──────────────────────────────────────────────

function EngineWeights({ engineScores }) {
  const weights = [
    {
      label:  "Rule Engine",
      weight: 55,
      score:  engineScores.rules,
      color:  "#4a90d9",
      desc:   "Pattern matching, keyword detection, regex rules",
    },
    {
      label:  "TF.js Neural Net",
      weight: 45,
      score:  engineScores.tfAvailable ? engineScores.tensorflow : null,
      color:  "#a78bfa",
      desc:   "Bag-of-words + feedforward neural network classifier",
    },
  ];

  return (
    <Card>
      <SectionTitle accent="#4a90d9">Hybrid Engine Weights</SectionTitle>
      {weights.map(({ label, weight, score, color, desc }) => (
        <div key={label} style={{ marginBottom: "16px" }}>
          <div style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            marginBottom:   "6px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width:        "8px",
                height:       "8px",
                borderRadius: "50%",
                background:   color,
                flexShrink:   0,
              }} />
              <span style={{ fontSize: "12px", color: THEME.textMuted }}>{label}</span>
              <Badge color={color}>{weight}% weight</Badge>
            </div>
            <span style={{
              fontSize:   "13px",
              fontWeight: 700,
              color:      score !== null ? color : THEME.textFaint,
            }}>
              {score !== null ? `${score}/100` : "N/A"}
            </span>
          </div>

          {/* Weight bar */}
          <div style={{
            height:       "4px",
            background:   THEME.border,
            borderRadius: "2px",
            overflow:     "hidden",
            marginBottom: "6px",
          }}>
            <div style={{
              height:     "100%",
              width:      `${weight}%`,
              background: color,
              borderRadius: "2px",
            }} />
          </div>

          <div style={{
            fontSize:   "10px",
            color:      THEME.textFaint,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>
            {desc}
          </div>
        </div>
      ))}
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MetricsTab({ result }) {
  const { modelPerformance, categoryBreakdown, redFlags, engineScores } = result;
  const mp = modelPerformance;

  // ── TF not yet ready ────────────────────────────────────────────────────────
  if (!mp?.tfAvailable && mp?.precision === null) {
    return (
      <Card>
        <div style={{
          textAlign:  "center",
          padding:    "40px 20px",
          color:      THEME.textDim,
          fontSize:   "13px",
          fontFamily: "'IBM Plex Sans', sans-serif",
          lineHeight: 1.8,
        }}>
          <div style={{ fontSize: "24px", marginBottom: "12px" }}>⟳</div>
          TensorFlow.js model is still training in the background.
          <br />
          Run another analysis in a few seconds to see full metrics.
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Primary ML metrics ──────────────────────────────────────── */}
      <Card>
        <SectionTitle>Model Performance — Classification Report</SectionTitle>
        <p style={{
          fontSize:   "12px",
          color:      THEME.textDim,
          margin:     "0 0 18px",
          fontFamily: "'IBM Plex Sans', sans-serif",
          lineHeight: 1.6,
        }}>
          Metrics computed by evaluating the trained TF.js classifier
          against all {mp?.datasetStats?.total ?? "—"} labeled training samples.
        </p>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap:                 "12px",
        }}>
          <MetricCard
            label="Precision"
            value={mp?.precision}
            description="Of postings flagged as scam, fraction that are actually scam"
            color="#ef4444"
          />
          <MetricCard
            label="Recall"
            value={mp?.recall}
            description="Of actual scam postings, fraction the model correctly caught"
            color="#f97316"
          />
          <MetricCard
            label="F1 Score"
            value={mp?.f1Score}
            description="Harmonic mean of precision and recall — overall model quality"
            color="#a78bfa"
          />
          <MetricCard
            label="Accuracy"
            value={mp?.accuracy ?? mp?.trainAccuracy}
            description="Fraction of all predictions that were correct"
            color="#22c55e"
          />
          <MetricCard
            label="Confidence"
            value={mp?.confidence}
            description="Model certainty for this specific prediction"
            color="#4a90d9"
          />
          <MetricCard
            label="Signal Density"
            value={mp?.signalDensity}
            description="Fraction of rules that fired on this posting"
            color="#f59e0b"
          />
        </div>
      </Card>

      {/* ── Confusion matrix ────────────────────────────────────────── */}
      <ConfusionMatrix matrix={mp?.confusionMatrix} />

      {/* ── Two column row ──────────────────────────────────────────── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "16px",
      }}>
        <CategoryBreakdown
          breakdown={categoryBreakdown}
          redFlagsTotal={redFlags.length}
        />
        <EngineWeights engineScores={engineScores} />
      </div>

      {/* ── Dataset and training info ────────────────────────────────── */}
      <DatasetStats
        stats={mp?.datasetStats}
        vocabSize={mp?.vocabSize}
        epochs={mp?.epochs}
        architecture={mp?.architecture}
      />

    </div>
  );
}