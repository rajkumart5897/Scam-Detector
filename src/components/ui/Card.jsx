// src/components/ui/Card.jsx
// The standard surface container used throughout the app.
// Accepts an optional `style` override for one-off adjustments.

import { THEME } from "../../constants/config";

export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background:   THEME.surface,
      border:       `1px solid ${THEME.border}`,
      borderRadius: "8px",
      padding:      "22px",
      ...style,
    }}>
      {children}
    </div>
  );
}