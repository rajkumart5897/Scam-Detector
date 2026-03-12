// src/components/ui/Badge.jsx
// A small inline label used for severity, categories, and status tags.

export default function Badge({ children, color = "#4a90d9", style = {} }) {
  return (
    <span style={{
      display:       "inline-block",
      padding:       "2px 9px",
      borderRadius:  "3px",
      fontSize:      "10px",
      letterSpacing: "0.1em",
      fontWeight:    700,
      color,
      border:        `1px solid ${color}44`,
      background:    `${color}11`,
      whiteSpace:    "nowrap",
      ...style,
    }}>
      {children}
    </span>
  );
}