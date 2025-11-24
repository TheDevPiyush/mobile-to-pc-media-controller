"use client";

import clsx from "clsx";
import type { ToastTone } from "@/lib/types";

interface ToastProps {
  message: string;
  tone?: ToastTone;
}

export default function Toast({ message, tone = "default" }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={clsx("toast", {
        "toast--visible": Boolean(message),
        "toast--error": tone === "error",
      })}
    >
      {message}
    </div>
  );
}

