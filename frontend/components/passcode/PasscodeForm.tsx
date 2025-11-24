"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PASSCODE_STORAGE_KEY } from "@/lib/config";
import { verifyPasscode } from "@/lib/api";
import Toast from "@/components/ui/Toast";

export default function PasscodeForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [toast, setToast] = useState<{ message: string; tone?: "error" | "default" }>({ message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passcode.trim()) {
      setToast({ message: "Passcode is required.", tone: "error" });
      return;
    }

    try {
      setSubmitting(true);
      setToast({ message: "Verifying passcode…" });
      await verifyPasscode(passcode.trim());
      localStorage.setItem(PASSCODE_STORAGE_KEY, passcode.trim());
      router.push("/controls");
    } catch (error) {
      console.error(error);
      setToast({
        message:
          error instanceof Error && error.message === "unauthorized"
            ? "Invalid passcode. Try again."
            : "Cannot reach API. Ensure your PC server is online.",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="heading">
        <h1>Unlock Remote</h1>
        <p>Enter your secure passcode to access playback controls.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="passcode">Passcode</label>
          <input
            id="passcode"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••"
            minLength={3}
            maxLength={8}
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            disabled={submitting}
          />
        </div>

        <button style={{padding:'10px'}} type="submit" disabled={submitting}>
          {submitting ? "Verifying…" : "Continue"}
          <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
        </button>
      </form>

      <Toast message={toast.message} tone={toast.tone} />
    </>
  );
}

