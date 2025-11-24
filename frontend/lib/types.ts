export type ToastTone = "default" | "error";

export interface AudioDevice {
  id: string;
  name: string;
  state: string;
  is_default: boolean;
}

