// src/components/ui/SectionTitle.jsx
import { THEME } from "../../constants/config";

export default function SectionTitle({
  children,
  accent = THEME.accent,
  style  = {},
}) {
  return (
    <div style={{
      fontSize:      "10px",
      letterSpacing: "0.16em",
      color:         accent,
      marginBottom:  "16px",
      display:       "flex",
      alignItems:    "center",
      gap:           "8px",
      textTransform: "uppercase",
      fontWeight:    500,
      ...style,
    }}>
      <div style={{
        width:        "3px",
        height:       "11px",
        background:   accent,
        borderRadius: "2px",
        flexShrink:   0,
        boxShadow:    `0 0 6px ${accent}80`,
      }} />
      {children}
    </div>
  );
}