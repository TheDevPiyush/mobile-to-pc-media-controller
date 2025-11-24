"use client";

import type { AudioDevice } from "@/lib/types";

interface DeviceSelectorProps {
  devices: AudioDevice[];
  value: string;
  loading: boolean;
  pending: boolean;
  onChange: (deviceId: string) => void;
  onRefresh: () => void;
  onRoute: () => void;
}

export default function DeviceSelector({
  devices,
  value,
  loading,
  pending,
  onChange,
  onRefresh,
  onRoute,
}: DeviceSelectorProps) {
  return (
    <section className="device-panel">
      <div className="panel-header" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <h2>Audio output</h2>
          <button
            type="button"
            className="link-button"
            aria-label="Refresh outputs"
            onClick={onRefresh}
          >
            <i className="fa-solid fa-rotate" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="device-form">
        <select
          id="device-select"
          className="device-select"
          disabled={loading || devices.length === 0}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {loading && <option>Loading devices…</option>}
          {!loading && devices.length === 0 && (
            <option>No active outputs detected</option>
          )}
          {!loading &&
            devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.is_default ? `${device.name} (Current)` : device.name}
              </option>
            ))}
        </select>

        <button
          type="button"
          className="pill-button"
          disabled={pending || !value}
          onClick={onRoute}
        >
          <i className="fa-solid fa-headphones" aria-hidden="true" />
          <span>{pending ? "Routing…" : "Route audio"}</span>
        </button>
      </div>
    </section>
  );
}

