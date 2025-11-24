"use client";

interface ActionPillsProps {
  disabled?: boolean;
  onMute: () => void;
  onChangePasscode: () => void;
}

export default function ActionPills({
  disabled,
  onMute,
  onChangePasscode,
}: ActionPillsProps) {
  return (
    <div className="controller-actions">
      <button
        type="button"
        className="button-pill"
        aria-label="Mute / unmute"
        disabled={disabled}
        onClick={onMute}
      >
        <i className="fa-solid fa-volume-xmark" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="button-pill subtle"
        aria-label="Change stored passcode"
        onClick={onChangePasscode}
      >
        <i className="fa-solid fa-key" aria-hidden="true" />
      </button>
    </div>
  );
}

