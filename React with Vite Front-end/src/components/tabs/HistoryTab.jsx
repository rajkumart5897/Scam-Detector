// src/components/tabs/HistoryTab.jsx
// Shows all past analyses from the SQLite database.
// Supports delete, feedback, and re-view.

import { useState }                   from "react";
import { Card, Badge, SectionTitle }  from "../ui";
import { THEME, RISK_CONFIG }         from "../../constants/config";

export default function HistoryTab({
  history,
  historyStats,
  historyLoading,
  onDelete,
  onFeedback,
}) {

  const [expandedId, setExpandedId] = useState(null);

  if (historyLoading) {
    return (
      <Card>
        <div style={{
          textAlign: "center", padding: "40px",
          color: THEME.textDim, fontSize: "12px",
        }}>
          Loading history…
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Stats summary ──────────────────────────────────────────── */}
      {historyStats && (
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap:                 "10px",
        }}>
          {[
            { label: "Total Scans",  value: historyStats.total_analyses,          color: THEME.accent   },
            { label: "Scams Found",  value: historyStats.scam_count,              color: "#ef4444"      },
            { label: "Safe Posts",   value: historyStats.legit_count,             color: "#22c55e"      },
            { label: "Scam Rate",    value: `${historyStats.scam_rate_pct}%`,     color: "#f59e0b"      },
            { label: "Avg Score",    value: historyStats.avg_scam_score,          color: THEME.textMuted},
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background:   THEME.bg,
              border:       `1px solid ${THEME.border}`,
              borderRadius: "6px",
              padding:      "14px",
              textAlign:    "center",
            }}>
              <div style={{
                fontSize:   "24px",
                fontWeight: 700,
                color,
                lineHeight: 1,
              }}>
                {value}
              </div>
              <div style={{
                fontSize:      "9px",
                color:         THEME.textFaint,
                marginTop:     "5px",
                letterSpacing: "0.1em",
              }}>
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── History list ────────────────────────────────────────────── */}
      <Card>
        <SectionTitle>Analysis History ({history.length})</SectionTitle>

        {history.length === 0 ? (
          <div style={{
            textAlign:  "center",
            padding:    "32px",
            color:      THEME.textDim,
            fontSize:   "13px",
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>
            No analyses yet. Run your first scan above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {history.map((item) => {
              const rc       = RISK_CONFIG[item.risk_level] || RISK_CONFIG.LOW;
              const isOpen   = expandedId === item.id;
              const date     = new Date(item.analyzed_at)
                .toLocaleString("en-IN", {
                  day: "2-digit", month: "short",
                  hour: "2-digit", minute: "2-digit",
                });

              return (
                <div key={item.id} style={{
                  background:   THEME.bg,
                  border:       `1px solid ${THEME.border}`,
                  borderLeft:   `3px solid ${rc.color}`,
                  borderRadius: "6px",
                  overflow:     "hidden",
                }}>
                  {/* Row */}
                  <div
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                    style={{
                      padding:        "12px 16px",
                      display:        "flex",
                      alignItems:     "center",
                      gap:            "12px",
                      cursor:         "pointer",
                      flexWrap:       "wrap",
                    }}
                  >
                    {/* Score */}
                    <div style={{
                      fontSize:   "20px",
                      fontWeight: 700,
                      color:      rc.color,
                      minWidth:   "40px",
                      textAlign:  "center",
                    }}>
                      {item.final_score}
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1, minWidth: "100px" }}>
                      <div style={{
                        fontSize:     "12px",
                        color:        THEME.textPrimary,
                        fontWeight:   600,
                        overflow:     "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace:   "nowrap",
                        maxWidth:     "300px",
                      }}>
                        {item.job_title || "Untitled Posting"}
                      </div>
                      <div style={{
                        fontSize:   "10px",
                        color:      THEME.textFaint,
                        marginTop:  "2px",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}>
                        {date} · {item.word_count} words
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <Badge color={rc.color}>{item.risk_level}</Badge>
                      <Badge color="#ef4444">
                        {item.red_flags_count} flags
                      </Badge>
                      {item.bert_available ? (
                        <Badge color="#a78bfa">BERT</Badge>
                      ) : (
                        <Badge color={THEME.textFaint}>No BERT</Badge>
                      )}
                    </div>

                    {/* Chevron */}
                    <span style={{
                      color:     THEME.textDim,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                      transition:"transform 0.2s",
                      display:   "inline-block",
                    }}>▾</span>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{
                      padding:    "0 16px 16px",
                      borderTop:  `1px solid ${THEME.borderLight}`,
                    }}>

                      {/* Model scores */}
                      <div style={{
                        display:             "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(100px,1fr))",
                        gap:                 "8px",
                        margin:              "12px 0",
                      }}>
                        {[
                          { label: "LR",   value: item.lr_score,   color: "#4a90d9" },
                          { label: "NB",   value: item.nb_score,   color: "#22c55e" },
                          { label: "RF",   value: item.rf_score,   color: "#f59e0b" },
                          { label: "SVM",  value: item.svm_score,  color: "#a78bfa" },
                          { label: "BERT", value: item.bert_score, color: "#ef4444" },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{
                            background:   THEME.surface,
                            border:       `1px solid ${THEME.border}`,
                            borderRadius: "4px",
                            padding:      "8px",
                            textAlign:    "center",
                          }}>
                            <div style={{
                              fontSize:   "16px",
                              fontWeight: 700,
                              color:      value != null ? color : THEME.textFaint,
                            }}>
                              {value != null ? value : "—"}
                            </div>
                            <div style={{
                              fontSize:      "9px",
                              color:         THEME.textFaint,
                              letterSpacing: "0.1em",
                            }}>
                              {label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Scam patterns */}
                      {item.scam_patterns?.length > 0 && (
                        <div style={{
                          display:  "flex",
                          flexWrap: "wrap",
                          gap:      "6px",
                          margin:   "8px 0",
                        }}>
                          {item.scam_patterns.map((p, i) => (
                            <Badge key={i} color="#f59e0b">{p}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{
                        display:   "flex",
                        gap:       "8px",
                        marginTop: "12px",
                        flexWrap:  "wrap",
                      }}>
                        <button
                          onClick={() => onFeedback(item.id, "correct")}
                          style={{
                            padding:    "5px 12px",
                            fontSize:   "10px",
                            background: "transparent",
                            border:     "1px solid #22c55e44",
                            color:      "#22c55e",
                            cursor:     "pointer",
                            borderRadius: "4px",
                            fontFamily: "inherit",
                            letterSpacing: "0.08em",
                          }}
                        >
                          ✓ CORRECT
                        </button>
                        <button
                          onClick={() => onFeedback(item.id, "incorrect")}
                          style={{
                            padding:    "5px 12px",
                            fontSize:   "10px",
                            background: "transparent",
                            border:     "1px solid #f59e0b44",
                            color:      "#f59e0b",
                            cursor:     "pointer",
                            borderRadius: "4px",
                            fontFamily: "inherit",
                            letterSpacing: "0.08em",
                          }}
                        >
                          ✗ INCORRECT
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          style={{
                            padding:    "5px 12px",
                            fontSize:   "10px",
                            background: "transparent",
                            border:     `1px solid ${THEME.border}`,
                            color:      THEME.textDim,
                            cursor:     "pointer",
                            borderRadius: "4px",
                            fontFamily: "inherit",
                            letterSpacing: "0.08em",
                            marginLeft: "auto",
                          }}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
