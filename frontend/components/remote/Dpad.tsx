"use client";

interface DpadProps {
  disabled?: boolean;
  onAction: (action: string) => void;
}

const dpadButtons = [
  { action: "volume-up", position: "up", icon: "fa-volume-high", label: "Volume up" },
  { action: "prev", position: "left", icon: "fa-backward-step", label: "Previous track" },
  { action: "toggle", position: "center", icon: "fa-play-pause", label: "Play or pause" },
  { action: "next", position: "right", icon: "fa-forward-step", label: "Next track" },
  { action: "volume-down", position: "down", icon: "fa-volume-low", label: "Volume down" },
];

export default function Dpad({ disabled, onAction }: DpadProps) {
  return (
    <div className="dpad">
      {dpadButtons.map(({ action, position, icon, label }) => (
        <button
          key={action}
          type="button"
          className={`dpad-btn ${position === "center" ? "center" : position}`}
          aria-label={label}
          disabled={disabled}
          onClick={() => onAction(action)}
        >
          <i className={`fa-solid ${icon}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

