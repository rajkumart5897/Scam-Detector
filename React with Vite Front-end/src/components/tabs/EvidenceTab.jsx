// src/components/tabs/EvidenceTab.jsx
// Renders every matched red flag as a detailed forensic card.
// Each card shows:
//   - Flag title, severity badge, category badge
//   - Exact evidence extracted from the posting
//   - Professional 2-3 sentence explanation
//   - Industry benchmark (what legitimate postings do instead)

import { useState }                      from "react";
import { Card, Badge, SectionTitle }     from "../ui";
import { SEVERITY_COLOR, THEME }         from "../../constants/config";

// ─── Severity sort order ──────────────────────────────────────────────────────
const SEV_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

// ─── Category accent colors ───────────────────────────────────────────────────
const CATEGORY_COLOR = {
  Financial:   "#ef4444",
  Identity:    "#f97316",
  Legitimacy:  "#f59e0b",
  Language:    "#94a3b8",
  Process:     "#a78bfa",
  Contact:     "#38bdf8",
};

export default function EvidenceTab({ result }) {
  const { redFlags } = result;

  // Track which cards are expanded (shows full explanation)
  const [expanded, setExpanded] = useState({});

  const toggle = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Filter state ────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filterOptions = [
    "ALL",
    ...["HIGH", "MEDIUM", "LOW"].filter(
      sev => redFlags.some(f => f.severity === sev)
    ),
  ];

  const visible = activeFilter === "ALL"
    ? [...redFlags].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])
    : redFlags.filter(f => f.severity === activeFilter);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (redFlags.length === 0) {
    return (
      <Card>
        <div style={{
          textAlign:  "center",
          padding:    "40px 20px",
          color:      "#22c55e",
          fontSize:   "14px",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>✓</div>
          No red flags detected — this posting appears legitimate.
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div style={{
        display:    "flex",
        gap:        "8px",
        alignItems: "center",
        flexWrap:   "wrap",
      }}>
        <span style={{
          fontSize:      "10px",
          letterSpacing: "0.12em",
          color:         THEME.textDim,
        }}>
          FILTER:
        </span>
        {filterOptions.map(opt => {
          const isActive = activeFilter === opt;
          const color    = opt === "ALL"
            ? THEME.accent
            : SEVERITY_COLOR[opt];
          return (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              style={{
                padding:       "4px 12px",
                fontSize:      "10px",
                letterSpacing: "0.1em",
                background:    isActive ? `${color}22` : "transparent",
                border:        `1px solid ${isActive ? color : THEME.border}`,
                color:         isActive ? color : THEME.textDim,
                cursor:        "pointer",
                borderRadius:  "4px",
                fontFamily:    "inherit",
                transition:    "all 0.15s",
              }}
            >
              {opt}
              {opt !== "ALL" && (
                <span style={{ marginLeft: "5px", opacity: 0.7 }}>
                  ({redFlags.filter(f => f.severity === opt).length})
                </span>
              )}
            </button>
          );
        })}

        <span style={{
          marginLeft:    "auto",
          fontSize:      "10px",
          color:         THEME.textFaint,
          letterSpacing: "0.08em",
        }}>
          {visible.length} of {redFlags.length} flags shown
        </span>
      </div>

      {/* ── Flag cards ──────────────────────────────────────────────── */}
      {visible.map((flag, i) => {
        const sevColor  = SEVERITY_COLOR[flag.severity];
        const catColor  = CATEGORY_COLOR[flag.category] || THEME.accent;
        const isOpen    = !!expanded[flag.id];

        return (
          <div
            key={flag.id}
            style={{
              background:   THEME.surface,
              border:       `1px solid ${THEME.border}`,
              borderLeft:   `3px solid ${sevColor}`,
              borderRadius: "8px",
              overflow:     "hidden",
              transition:   "border-color 0.15s",
            }}
          >
            {/* ── Card header (always visible) ──────────────────────── */}
            <div
              onClick={() => toggle(flag.id)}
              style={{
                padding:        "16px 20px",
                cursor:         "pointer",
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "flex-start",
                gap:            "12px",
              }}
            >
              {/* Left: index + title */}
              <div style={{
                display:    "flex",
                alignItems: "center",
                gap:        "10px",
                flex:       1,
                minWidth:   0,
              }}>
                <span style={{
                  fontSize:      "11px",
                  color:         THEME.textFaint,
                  fontWeight:    700,
                  flexShrink:    0,
                }}>
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <span style={{
                  fontSize:     "13px",
                  fontWeight:   700,
                  color:        THEME.textPrimary,
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}>
                  {flag.title}
                </span>
              </div>

              {/* Right: badges + chevron */}
              <div style={{
                display:    "flex",
                gap:        "6px",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <Badge color={sevColor}>{flag.severity}</Badge>
                <Badge color={catColor}>{flag.category}</Badge>
                <span style={{
                  color:      THEME.textDim,
                  fontSize:   "12px",
                  marginLeft: "4px",
                  transition: "transform 0.2s",
                  transform:  isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  display:    "inline-block",
                }}>
                  ▾
                </span>
              </div>
            </div>

            {/* ── Evidence block (always visible) ───────────────────── */}
            <div style={{
              margin:       "0 20px 16px",
              background:   THEME.bg,
              border:       `1px solid ${THEME.border}`,
              borderLeft:   `3px solid ${sevColor}66`,
              borderRadius: "4px",
              padding:      "12px 16px",
            }}>
              <div style={{
                fontSize:      "9px",
                letterSpacing: "0.15em",
                color:         THEME.textDim,
                marginBottom:  "6px",
              }}>
                EVIDENCE — EXTRACTED FROM POSTING
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

            {/* ── Expandable detail ─────────────────────────────────── */}
            {isOpen && (
              <div style={{ padding: "0 20px 20px" }}>

                {/* Points contribution */}
                <div style={{
                  display:       "flex",
                  alignItems:    "center",
                  gap:           "8px",
                  marginBottom:  "14px",
                }}>
                  <span style={{
                    fontSize:      "10px",
                    letterSpacing: "0.1em",
                    color:         THEME.textDim,
                  }}>
                    SCORE CONTRIBUTION:
                  </span>
                  <div style={{
                    background:   `${sevColor}22`,
                    border:       `1px solid ${sevColor}44`,
                    borderRadius: "3px",
                    padding:      "2px 8px",
                    fontSize:     "11px",
                    color:        sevColor,
                    fontWeight:   700,
                  }}>
                    +{flag.points} pts
                  </div>
                </div>

                {/* Analysis */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{
                    fontSize:      "9px",
                    letterSpacing: "0.15em",
                    color:         THEME.textDim,
                    marginBottom:  "6px",
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

                {/* Industry benchmark */}
                <div style={{
                  background:   "#052010",
                  border:       "1px solid #0a4020",
                  borderRadius: "4px",
                  padding:      "12px 14px",
                }}>
                  <div style={{
                    fontSize:      "9px",
                    letterSpacing: "0.15em",
                    color:         "#0a6030",
                    marginBottom:  "5px",
                  }}>
                    ✓ WHAT LEGITIMATE POSTINGS DO INSTEAD
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
            )}
          </div>
        );
      })}

      {/* ── Footer note ─────────────────────────────────────────────── */}
      <div style={{
        fontSize:   "11px",
        color:      THEME.textFaint,
        textAlign:  "center",
        padding:    "8px",
        fontFamily: "'IBM Plex Sans', sans-serif",
        lineHeight: 1.6,
      }}>
        Click any flag card to expand full analysis and industry benchmark.
        Evidence is extracted directly from the submitted posting.
      </div>

    </div>
  );
}