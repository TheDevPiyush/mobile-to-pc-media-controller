import { API_BASE } from "./config";
import type { AudioDevice } from "./types";

const buildUrl = (path: string, params: Record<string, string>) => {
  const url = new URL(path, API_BASE);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );
  return url.toString();
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    throw new Error("unauthorized");
  }

  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ detail: "Request failed" }));
    throw new Error(message.detail ?? "Request failed");
  }

  return response.json();
};

export const verifyPasscode = async (passcode: string) => {
  const url = buildUrl("/check-passcode", { passcode });
  await handleResponse(await fetch(url));
};

export const triggerMediaAction = async (action: string, passcode: string) => {
  const url = buildUrl(`/${action}`, { passcode });
  const response = await fetch(url);
  await handleResponse(response);
};

export const getAudioDevices = async (passcode: string) => {
  const url = buildUrl("/audio-devices", { passcode });
  const payload = await handleResponse(await fetch(url));
  return (payload.devices ?? []) as AudioDevice[];
};

export const setAudioDevice = async (deviceId: string, passcode: string) => {
  const url = buildUrl("/audio-devices/select", {
    device_id: deviceId,
    passcode,
  });
  const response = await fetch(url, { method: "POST" });
  await handleResponse(response);
};

