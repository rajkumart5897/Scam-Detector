// src/components/ResultPanel.jsx
import { useState }      from "react";
import { THEME }         from "../constants/config";
import RiskBanner        from "./RiskBanner";
import OverviewTab       from "./tabs/OverviewTab";
import EvidenceTab       from "./tabs/EvidenceTab";
import MetricsTab        from "./tabs/MetricsTab";
import ReportTab         from "./tabs/ReportTab";
import HistoryTab        from "./tabs/HistoryTab";

const TABS = [
  { id: "overview", label: "Overview",   desc: "Summary & engine scores"        },
  { id: "evidence", label: "Evidence",   desc: "Red flags & forensic detail"    },
  { id: "metrics",  label: "ML Metrics", desc: "Precision, recall, F1"          },
  { id: "report",   label: "Report",     desc: "Full printable forensic report" },
  { id: "history",  label: "History",    desc: "Past analyses from database"    },
];

export default function ResultPanel({
  result,
  history,
  historyStats,
  historyLoading,
  onDelete,
  onFeedback,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabComponents = {
    overview: <OverviewTab result={result} />,
    evidence: <EvidenceTab result={result} />,
    metrics:  <MetricsTab  result={result} />,
    report:   <ReportTab   result={result} />,
    history:  <HistoryTab
                history={history        || []}
                historyStats={historyStats}
                historyLoading={historyLoading}
                onDelete={onDelete}
                onFeedback={onFeedback}
              />,
  };

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .tab-btn { transition: all 0.15s; }
        .tab-btn:hover { color: var(--text-color) !important; }
      `}</style>

      {/* Risk banner */}
      <RiskBanner result={result} />

      {/* Tab bar */}
      <div style={{
        display:      "flex",
        gap:          "2px",
        borderBottom: `1px solid ${THEME.border}`,
        marginBottom: "16px",
        overflowX:    "auto",
        scrollbarWidth: "none",
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const isHistory = tab.id === "history";
          const count = isHistory && history?.length > 0
            ? history.length : null;

          return (
            <button
              key={tab.id}
              className="tab-btn"
              onClick={() => setActiveTab(tab.id)}
              title={tab.desc}
              style={{
                padding:       "10px 18px",
                fontSize:      "10px",
                letterSpacing: "0.1em",
                background:    "transparent",
                border:        "none",
                borderBottom:  isActive
                  ? `2px solid ${THEME.accent}`
                  : "2px solid transparent",
                color:         isActive
                  ? THEME.accent
                  : THEME.textDim,
                cursor:        "pointer",
                fontFamily:    "inherit",
                fontWeight:    isActive ? 500 : 400,
                textTransform: "uppercase",
                marginBottom:  "-1px",
                whiteSpace:    "nowrap",
                display:       "flex",
                alignItems:    "center",
                gap:           "6px",
                "--text-color": isActive ? THEME.accent : THEME.textMuted,
              }}
            >
              {tab.label}
              {count != null && (
                <span style={{
                  background:    isActive
                    ? `${THEME.accent}20`
                    : THEME.border,
                  border:        `1px solid ${isActive ? THEME.accent + "40" : "transparent"}`,
                  borderRadius:  "10px",
                  padding:       "0 6px",
                  fontSize:      "9px",
                  color:         isActive ? THEME.accent : THEME.textDim,
                  fontWeight:    600,
                  lineHeight:    "16px",
                  display:       "inline-block",
                  minWidth:      "18px",
                  textAlign:     "center",
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <div key={activeTab} style={{ animation: "fadeUp 0.2s ease" }}>
        {tabComponents[activeTab]}
      </div>
    </div>
  );
}