export default function Badge({ children, color = "var(--accent)", style = {} }) {
  return (
    <span style={{
      display:       "inline-flex",
      alignItems:    "center",
      padding:       "2px 7px",
      borderRadius:  "4px",
      fontSize:      "10px",
      letterSpacing: "0.06em",
      fontWeight:    500,
      color,
      border:        `1px solid ${color}30`,
      background:    `${color}12`,
      whiteSpace:    "nowrap",
      lineHeight:    1.6,
      fontFamily:    "var(--font-mono)",
      ...style,
    }}>
      {children}
    </span>
  );
}