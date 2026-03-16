// src/components/ui/Badge.jsx
export default function Badge({ children, color = "#3b82f6", style = {} }) {
  return (
    <span style={{
      display:       "inline-flex",
      alignItems:    "center",
      padding:       "2px 8px",
      borderRadius:  "4px",
      fontSize:      "10px",
      letterSpacing: "0.08em",
      fontWeight:    500,
      color,
      border:        `1px solid ${color}30`,
      background:    `${color}12`,
      whiteSpace:    "nowrap",
      lineHeight:    1.6,
      ...style,
    }}>
      {children}
    </span>
  );
}