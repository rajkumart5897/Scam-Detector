// src/components/ResultPanel.jsx
// Renders the full results area:
//   - RiskBanner at the top
//   - Tab navigation bar
//   - Active tab content

import { useState }      from "react";
import { THEME }         from "../constants/config";
import RiskBanner        from "./RiskBanner";
import OverviewTab       from "./tabs/OverviewTab";
import EvidenceTab       from "./tabs/EvidenceTab";
import MetricsTab        from "./tabs/MetricsTab";
import ReportTab         from "./tabs/ReportTab";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  {
    id:      "overview",
    label:   "Overview",
    desc:    "Summary & engine scores",
  },
  {
    id:      "evidence",
    label:   "Evidence",
    desc:    "Red flags & forensic detail",
  },
  {
    id:      "metrics",
    label:   "ML Metrics",
    desc:    "Precision, recall, F1, confusion matrix",
  },
  {
    id:      "report",
    label:   "Report",
    desc:    "Full printable forensic report",
  },
];

export default function ResultPanel({ result }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Reset to overview whenever a new result comes in
  // (handled by key prop in App.jsx)

  const tabComponents = {
    overview: <OverviewTab result={result} />,
    evidence: <EvidenceTab result={result} />,
    metrics:  <MetricsTab  result={result} />,
    report:   <ReportTab   result={result} />,
  };

  return (
    <div>

      {/* Risk banner */}
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
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <div style={{ animation: "fadeUp 0.3s ease" }}>
        {tabComponents[activeTab]}
      </div>

    </div>
  );
}