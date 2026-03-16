// src/components/tabs/EvidenceTab.jsx
import { useState }                  from "react";
import { Card, Badge, SectionTitle } from "../ui";
import { SEVERITY_COLOR, THEME }     from "../../constants/config";

const SEV_ORDER    = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const CATEGORY_COLOR = {
  Financial:  "#ef4444",
  Identity:   "#f97316",
  Legitimacy: "#f59e0b",
  Language:   "#94a3b8",
  Process:    "#8b5cf6",
  Contact:    "#06b6d4",
};

export default function EvidenceTab({ result }) {
  const { redFlags } = result;
  const [expanded, setExpanded]       = useState({});
  const [activeFilter, setActiveFilter] = useState("ALL");

  const toggle = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const filterOptions = [
    "ALL",
    ...["HIGH","MEDIUM","LOW"].filter(
      sev => redFlags.some(f => f.severity === sev)
    ),
  ];

  const visible = activeFilter === "ALL"
    ? [...redFlags].sort((a,b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])
    : redFlags.filter(f => f.severity === activeFilter);

  if (redFlags.length === 0) {
    return (
      <Card>
        <div style={{
          textAlign:  "center",
          padding:    "48px 20px",
          color:      "#10b981",
          fontSize:   "14px",
          fontFamily: "var(--font-sans, sans-serif)",
        }}>
          <div style={{ fontSize: "36px", marginBottom: "14px" }}>✓</div>
          No red flags detected — this posting appears legitimate.
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Filter bar */}
      <div style={{
        display:    "flex",
        gap:        "6px",
        alignItems: "center",
        flexWrap:   "wrap",
      }}>
        <span style={{
          fontSize:      "10px",
          letterSpacing: "0.12em",
          color:         THEME.textFaint,
        }}>
          FILTER:
        </span>
        {filterOptions.map(opt => {
          const isActive = activeFilter === opt;
          const color    = opt === "ALL" ? THEME.accent : SEVERITY_COLOR[opt];
          return (
            <button key={opt} onClick={() => setActiveFilter(opt)} style={{
              padding:       "4px 12px",
              fontSize:      "10px",
              letterSpacing: "0.08em",
              background:    isActive ? `${color}15` : "transparent",
              border:        `1px solid ${isActive ? color : THEME.border}`,
              color:         isActive ? color : THEME.textDim,
              cursor:        "pointer",
              borderRadius:  "5px",
              fontFamily:    "inherit",
              fontWeight:    isActive ? 500 : 400,
              transition:    "all 0.15s",
            }}>
              {opt}
              {opt !== "ALL" && (
                <span style={{ marginLeft: "4px", opacity: 0.6 }}>
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
          letterSpacing: "0.06em",
        }}>
          {visible.length} of {redFlags.length} shown
        </span>
      </div>

      {/* Flag cards */}
      {visible.map((flag, i) => {
        const sevColor = SEVERITY_COLOR[flag.severity];
        const catColor = CATEGORY_COLOR[flag.category] || THEME.accent;
        const isOpen   = !!expanded[flag.id];

        return (
          <div key={flag.id} style={{
            background:   THEME.surface,
            border:       `1px solid ${THEME.border}`,
            borderLeft:   `3px solid ${sevColor}`,
            borderRadius: "8px",
            overflow:     "hidden",
            transition:   "border-color 0.15s, box-shadow 0.15s",
            boxShadow:    isOpen ? `0 0 20px ${sevColor}10` : "none",
          }}>

            {/* Header — always visible */}
            <div
              onClick={() => toggle(flag.id)}
              style={{
                padding:        "14px 18px",
                cursor:         "pointer",
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "center",
                gap:            "12px",
              }}
            >
              <div style={{
                display:    "flex",
                alignItems: "center",
                gap:        "10px",
                flex:       1,
                minWidth:   0,
              }}>
                <span style={{
                  fontSize:      "10px",
                  color:         THEME.textFaint,
                  fontWeight:    600,
                  flexShrink:    0,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  #{String(i+1).padStart(2,"0")}
                </span>
                <span style={{
                  fontSize:     "13px",
                  fontWeight:   500,
                  color:        THEME.textPrimary,
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}>
                  {flag.title}
                </span>
              </div>
              <div style={{
                display:    "flex",
                gap:        "5px",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <Badge color={sevColor}>{flag.severity}</Badge>
                <Badge color={catColor}>{flag.category}</Badge>
                <span style={{
                  color:      THEME.textDim,
                  fontSize:   "11px",
                  marginLeft: "4px",
                  transition: "transform 0.2s",
                  transform:  isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  display:    "inline-block",
                }}>▾</span>
              </div>
            </div>

            {/* Evidence — always visible */}
            <div style={{
              margin:       "0 18px 14px",
              background:   "rgba(255,255,255,0.02)",
              border:       `1px solid ${THEME.border}`,
              borderLeft:   `2px solid ${sevColor}50`,
              borderRadius: "5px",
              padding:      "10px 14px",
            }}>
              <div style={{
                fontSize:      "9px",
                letterSpacing: "0.14em",
                color:         THEME.textFaint,
                marginBottom:  "5px",
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

            {/* Expandable detail */}
            {isOpen && (
              <div style={{ padding: "0 18px 18px" }}>

                {/* Score contribution */}
                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "8px",
                  marginBottom: "14px",
                }}>
                  <span style={{
                    fontSize:      "10px",
                    letterSpacing: "0.1em",
                    color:         THEME.textDim,
                  }}>
                    SCORE CONTRIBUTION:
                  </span>
                  <span style={{
                    background:   `${sevColor}15`,
                    border:       `1px solid ${sevColor}30`,
                    borderRadius: "4px",
                    padding:      "2px 8px",
                    fontSize:     "11px",
                    color:        sevColor,
                    fontWeight:   600,
                  }}>
                    +{flag.points} pts
                  </span>
                </div>

                {/* Analysis */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{
                    fontSize:      "9px",
                    letterSpacing: "0.14em",
                    color:         THEME.textFaint,
                    marginBottom:  "6px",
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
                    letterSpacing: "0.14em",
                    color:         "rgba(16,185,129,0.6)",
                    marginBottom:  "4px",
                  }}>
                    ✓ WHAT LEGITIMATE POSTINGS DO INSTEAD
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
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div style={{
        fontSize:   "11px",
        color:      THEME.textFaint,
        textAlign:  "center",
        padding:    "4px",
        fontFamily: "var(--font-sans, sans-serif)",
      }}>
        Click any flag to expand full analysis and industry benchmark.
      </div>
    </div>
  );
}