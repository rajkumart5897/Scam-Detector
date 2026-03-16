export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background:   "var(--bg-elevated)",
      border:       "1px solid var(--border)",
      borderRadius: "8px",
      padding:      "20px",
      boxShadow:    "var(--shadow-sm)",
      transition:   "border-color 0.15s",
      ...style,
    }}>
      {children}
    </div>
  );
}