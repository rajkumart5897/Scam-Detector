import { THEME } from "../../constants/config";

export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background:   THEME.surface,
      border:       `1px solid ${THEME.border}`,
      borderRadius: "8px",
      padding:      "20px",
      boxShadow:    "0 1px 3px rgba(0,0,0,0.3)",
      ...style,
    }}>
      {children}
    </div>
  );
}