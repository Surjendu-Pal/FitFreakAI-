// component/AiOrb.jsx
// Small AI avatar shown once per AI message turn.
import "./AiOrb.css";

export default function AiOrb({ size = "md", pulse = false }) {
  return (
    <span className={`ai-orb ai-orb-${size}${pulse ? " ai-orb-pulse" : ""}`} aria-hidden="true">
      <span className="ai-orb-core" />
      <span className="ai-orb-ring" />
    </span>
  );
}
