"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Dpad from "@/components/remote/Dpad";
import ActionPills from "@/components/remote/ActionPills";
import DeviceSelector from "@/components/remote/DeviceSelector";
import Toast from "@/components/ui/Toast";
import { PASSCODE_STORAGE_KEY } from "@/lib/config";
import {
  getAudioDevices,
  setAudioDevice,
  triggerMediaAction,
  verifyPasscode,
} from "@/lib/api";
import type { AudioDevice, ToastTone } from "@/lib/types";

export default function ControlsPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone }>({
    message: "",
    tone: "default",
  });
  const [actionBusy, setActionBusy] = useState(false);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesPending, setDevicesPending] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("");

  const showToast = useCallback(
    (message: string, tone: ToastTone = "default") => {
      setToast({ message, tone });
    },
    []
  );

  useEffect(() => {
    const stored = localStorage.getItem(PASSCODE_STORAGE_KEY);
    if (!stored) {
      router.replace("/");
      return;
    }
    setPasscode(stored);
  }, [router]);

  const syncDevices = useCallback(
    async (notify?: boolean) => {
      if (!passcode) {
        return;
      }
      setDevicesLoading(true);
      try {
        const list = await getAudioDevices(passcode);
        setDevices(list);
        const preferred =
          list.find((device) => device.is_default) ?? list[0] ?? null;
        setSelectedDevice(preferred?.id ?? "");
        if (notify) {
          showToast("Outputs refreshed.");
        }
      } catch (error) {
        console.error(error);
        showToast("Unable to load devices.", "error");
      } finally {
        setDevicesLoading(false);
      }
    },
    [passcode, showToast]
  );

  useEffect(() => {
    let mounted = true;
    if (!passcode) {
      return;
    }

    (async () => {
      try {
        await verifyPasscode(passcode);
        if (mounted) {
          await syncDevices();
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem(PASSCODE_STORAGE_KEY);
        router.replace("/");
        showToast(
          "Passcode invalid. Please re-authenticate.",
          "error"
        );
      }
    })();

    return () => {
      mounted = false;
    };
  }, [passcode, router, showToast, syncDevices]);

  const handleAction = useCallback(
    async (action: string) => {
      if (!passcode) {
        return;
      }
      setActionBusy(true);
      try {
        await triggerMediaAction(action, passcode);
        showToast(`Sent ${action.replace("-", " ")} command.`);
      } catch (error) {
        console.error(error);
        showToast("Action failed. Confirm backend is running.", "error");
      } finally {
        setActionBusy(false);
      }
    },
    [passcode, showToast]
  );

  const handleRouteAudio = useCallback(async () => {
    if (!passcode || !selectedDevice) {
      showToast("Select a device first.", "error");
      return;
    }
    setDevicesPending(true);
    try {
      await setAudioDevice(selectedDevice, passcode);
      showToast("Audio routed to selected device.");
      await syncDevices();
    } catch (error) {
      console.error(error);
      showToast("Unable to change output.", "error");
    } finally {
      setDevicesPending(false);
    }
  }, [passcode, selectedDevice, showToast, syncDevices]);

  const disableControls = useMemo(
    () => actionBusy || !passcode,
    [actionBusy, passcode]
  );

  const handleChangePasscode = useCallback(() => {
    localStorage.removeItem(PASSCODE_STORAGE_KEY);
    router.replace("/");
  }, [router]);

  return (
    <div className="app-shell">
      <main className="card card--wide">
        <section className="controller">
          <Dpad disabled={disableControls} onAction={handleAction} />
          <ActionPills
            disabled={disableControls}
            onMute={() => handleAction("mute")}
            onChangePasscode={handleChangePasscode}
          />
        </section>

        <DeviceSelector
          devices={devices}
          value={selectedDevice}
          loading={devicesLoading}
          pending={devicesPending}
          onChange={setSelectedDevice}
          onRefresh={() => syncDevices(true)}
          onRoute={handleRouteAudio}
        />

        <Toast message={toast.message} tone={toast.tone} />
      </main>
    </div>
  );
}

