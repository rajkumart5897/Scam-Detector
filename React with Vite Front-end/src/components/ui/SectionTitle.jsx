export default function SectionTitle({
  children,
  accent = "var(--accent)",
  style  = {},
}) {
  return (
    <div style={{
      fontSize:      "10px",
      letterSpacing: "0.14em",
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
      }} />
      {children}
    </div>
  );
}