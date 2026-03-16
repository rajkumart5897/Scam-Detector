// src/components/tabs/HistoryTab.jsx
import { useState }                  from "react";
import { Card, Badge, SectionTitle } from "../ui";
import { THEME, RISK_CONFIG }        from "../../constants/config";

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
          textAlign:  "center",
          padding:    "40px",
          color:      THEME.textDim,
          fontSize:   "12px",
          fontFamily: "var(--font-sans, sans-serif)",
        }}>
          <div style={{
            width:        "20px",
            height:       "20px",
            border:       `2px solid ${THEME.border}`,
            borderTop:    `2px solid ${THEME.accent}`,
            borderRadius: "50%",
            margin:       "0 auto 12px",
            animation:    "spin 0.8s linear infinite",
          }} />
          Loading history…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      {historyStats && historyStats.total_analyses > 0 && (
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap:                 "10px",
        }}>
          {[
            {
              label: "Total Scans",
              value: historyStats.total_analyses,
              color: THEME.accent,
            },
            {
              label: "Scams Found",
              value: historyStats.scam_count,
              color: "#ef4444",
            },
            {
              label: "Safe Posts",
              value: historyStats.legit_count,
              color: "#10b981",
            },
            {
              label: "Scam Rate",
              value: `${historyStats.scam_rate_pct}%`,
              color: "#f59e0b",
            },
            {
              label: "Avg Score",
              value: historyStats.avg_scam_score,
              color: THEME.textMuted,
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background:   "rgba(255,255,255,0.02)",
              border:       `1px solid ${THEME.border}`,
              borderRadius: "7px",
              padding:      "14px",
              textAlign:    "center",
              transition:   "border-color 0.15s",
            }}>
              <div style={{
                fontSize:   "22px",
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
                letterSpacing: "0.1em",
              }}>
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── History list ──────────────────────────────────────────── */}
      <Card>
        <SectionTitle>
          Analysis History ({history.length})
        </SectionTitle>

        {history.length === 0 ? (
          <div style={{
            textAlign:  "center",
            padding:    "40px 20px",
            color:      THEME.textDim,
            fontSize:   "13px",
            fontFamily: "var(--font-sans, sans-serif)",
            lineHeight: 1.8,
          }}>
            <div style={{
              fontSize:     "32px",
              marginBottom: "12px",
              opacity:      0.3,
            }}>
              ◷
            </div>
            No analyses yet.
            <br />
            Run your first scan above.
          </div>
        ) : (
          <div style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "6px",
          }}>
            {history.map((item) => {
              const rc     = RISK_CONFIG[item.risk_level] || RISK_CONFIG.LOW;
              const isOpen = expandedId === item.id;
              const date   = new Date(item.analyzed_at)
                .toLocaleString("en-IN", {
                  day:    "2-digit",
                  month:  "short",
                  hour:   "2-digit",
                  minute: "2-digit",
                });

              return (
                <div key={item.id} style={{
                  background:   "rgba(255,255,255,0.02)",
                  border:       `1px solid ${isOpen ? rc.border : THEME.border}`,
                  borderLeft:   `3px solid ${rc.color}`,
                  borderRadius: "7px",
                  overflow:     "hidden",
                  transition:   "all 0.15s",
                  boxShadow:    isOpen ? `0 0 16px ${rc.glow}` : "none",
                }}>

                  {/* Row header */}
                  <div
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                    style={{
                      padding:    "12px 16px",
                      cursor:     "pointer",
                      display:    "flex",
                      alignItems: "center",
                      gap:        "12px",
                      flexWrap:   "wrap",
                    }}
                  >
                    {/* Score */}
                    <div style={{
                      fontSize:   "18px",
                      fontWeight: 700,
                      color:      rc.color,
                      minWidth:   "36px",
                      textAlign:  "center",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {item.final_score}
                    </div>

                    {/* Title + date */}
                    <div style={{ flex: 1, minWidth: "100px" }}>
                      <div style={{
                        fontSize:     "12px",
                        color:        THEME.textPrimary,
                        fontWeight:   500,
                        overflow:     "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace:   "nowrap",
                        maxWidth:     "320px",
                      }}>
                        {item.job_title || "Untitled Posting"}
                      </div>
                      <div style={{
                        fontSize:   "10px",
                        color:      THEME.textFaint,
                        marginTop:  "2px",
                        fontFamily: "var(--font-sans, sans-serif)",
                      }}>
                        {date} · {item.word_count} words
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={{
                      display:    "flex",
                      gap:        "5px",
                      alignItems: "center",
                      flexShrink: 0,
                    }}>
                      <Badge color={rc.color}>{item.risk_level}</Badge>
                      <Badge color="#ef4444">
                        {item.red_flags_count} flags
                      </Badge>
                      {item.bert_available
                        ? <Badge color="#10b981">BERT</Badge>
                        : <Badge color={THEME.textFaint}>No BERT</Badge>
                      }
                    </div>

                    {/* Chevron */}
                    <span style={{
                      color:     THEME.textDim,
                      fontSize:  "12px",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                      transition:"transform 0.2s",
                      display:   "inline-block",
                      flexShrink: 0,
                    }}>
                      ▾
                    </span>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div style={{
                      padding:    "0 16px 16px",
                      borderTop:  `1px solid ${THEME.borderLight}`,
                    }}>

                      {/* Model scores grid */}
                      <div style={{
                        display:             "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(90px,1fr))",
                        gap:                 "8px",
                        margin:              "12px 0",
                      }}>
                        {[
                          { label: "LR",       value: item.lr_score,   color: "#8b5cf6" },
                          { label: "NB",       value: item.nb_score,   color: "#06b6d4" },
                          { label: "RF",       value: item.rf_score,   color: "#f59e0b" },
                          { label: "SVM",      value: item.svm_score,  color: "#ec4899" },
                          { label: "BERT",     value: item.bert_score, color: "#10b981" },
                          { label: "ENSEMBLE", value: item.ensemble_score, color: "#3b82f6" },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{
                            background:   THEME.surface,
                            border:       `1px solid ${THEME.border}`,
                            borderRadius: "5px",
                            padding:      "8px",
                            textAlign:    "center",
                          }}>
                            <div style={{
                              fontSize:   "16px",
                              fontWeight: 600,
                              color:      value != null ? color : THEME.textFaint,
                              fontVariantNumeric: "tabular-nums",
                            }}>
                              {value != null ? value : "—"}
                            </div>
                            <div style={{
                              fontSize:      "9px",
                              color:         THEME.textFaint,
                              letterSpacing: "0.08em",
                              marginTop:     "3px",
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
                          gap:      "5px",
                          margin:   "8px 0",
                        }}>
                          {item.scam_patterns.map((p, i) => (
                            <Badge key={i} color="#f59e0b"
                              style={{ fontSize: "10px" }}>
                              {p}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{
                        display:   "flex",
                        gap:       "6px",
                        marginTop: "12px",
                        flexWrap:  "wrap",
                      }}>
                        <button
                          onClick={() => onFeedback(item.id, "correct")}
                          style={{
                            padding:       "5px 12px",
                            fontSize:      "10px",
                            letterSpacing: "0.08em",
                            background:    "rgba(16,185,129,0.08)",
                            border:        "1px solid rgba(16,185,129,0.2)",
                            color:         "#10b981",
                            cursor:        "pointer",
                            borderRadius:  "5px",
                            fontFamily:    "inherit",
                            fontWeight:    500,
                            transition:    "all 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.15)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(16,185,129,0.08)"}
                        >
                          ✓ CORRECT
                        </button>

                        <button
                          onClick={() => onFeedback(item.id, "incorrect")}
                          style={{
                            padding:       "5px 12px",
                            fontSize:      "10px",
                            letterSpacing: "0.08em",
                            background:    "rgba(245,158,11,0.08)",
                            border:        "1px solid rgba(245,158,11,0.2)",
                            color:         "#f59e0b",
                            cursor:        "pointer",
                            borderRadius:  "5px",
                            fontFamily:    "inherit",
                            fontWeight:    500,
                            transition:    "all 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.15)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.08)"}
                        >
                          ✗ INCORRECT
                        </button>

                        <button
                          onClick={() => onDelete(item.id)}
                          style={{
                            padding:       "5px 12px",
                            fontSize:      "10px",
                            letterSpacing: "0.08em",
                            background:    "transparent",
                            border:        `1px solid ${THEME.border}`,
                            color:         THEME.textDim,
                            cursor:        "pointer",
                            borderRadius:  "5px",
                            fontFamily:    "inherit",
                            transition:    "all 0.15s",
                            marginLeft:    "auto",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#ef4444";
                            e.currentTarget.style.color       = "#ef4444";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = THEME.border;
                            e.currentTarget.style.color       = THEME.textDim;
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