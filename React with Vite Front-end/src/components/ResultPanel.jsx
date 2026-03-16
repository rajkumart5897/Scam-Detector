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
                history={history       || []}
                historyStats={historyStats}
                historyLoading={historyLoading}
                onDelete={onDelete}
                onFeedback={onFeedback}
              />,
  };

  return (
    <div>
      <RiskBanner result={result} />

      {/* Tab bar */}
      <div style={{
        display:      "flex",
        gap:          "2px",
        borderBottom: `1px solid ${THEME.border}`,
        marginBottom: "16px",
        overflowX:    "auto",
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.desc}
              style={{
                padding:       "10px 20px",
                fontSize:      "10px",
                letterSpacing: "0.12em",
                background:    isActive ? THEME.surface : "transparent",
                border:        "none",
                borderBottom:  isActive
                  ? `2px solid ${THEME.accent}`
                  : "2px solid transparent",
                color:         isActive ? THEME.accent : THEME.textDim,
                cursor:        "pointer",
                fontFamily:    "inherit",
                textTransform: "uppercase",
                marginBottom:  "-1px",
                whiteSpace:    "nowrap",
                transition:    "all 0.15s",
              }}
            >
              {tab.label}
              {tab.id === "history" && history?.length > 0 && (
                <span style={{
                  marginLeft:    "5px",
                  background:    THEME.border,
                  borderRadius:  "8px",
                  padding:       "1px 5px",
                  fontSize:      "9px",
                  color:         THEME.textMuted,
                }}>
                  {history.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab */}
      <div style={{ animation: "fadeUp 0.3s ease" }}>
        {tabComponents[activeTab]}
      </div>
    </div>
  );
}