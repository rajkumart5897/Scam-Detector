// src/components/ui/SectionTitle.jsx
// A labelled section header with a left accent bar.
// Used at the top of every Card to identify its content.

import { THEME } from "../../constants/config";

export default function SectionTitle({
  children,
  accent = THEME.accent,
  style  = {},
}) {
  return (
    <div style={{
      fontSize:      "10px",
      letterSpacing: "0.18em",
      color:         accent,
      marginBottom:  "16px",
      display:       "flex",
      alignItems:    "center",
      gap:           "8px",
      textTransform: "uppercase",
      ...style,
    }}>
      {/* Left accent bar */}
      <div style={{
        width:        "3px",
        height:       "12px",
        background:   accent,
        borderRadius: "2px",
        flexShrink:   0,
      }} />
      {children}
    </div>
  );
}