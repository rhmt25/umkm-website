"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; message: string; title?: string };
type ToastContextValue = {
  showToast: (message: string, type?: ToastType, title?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION: Record<ToastType, number> = {
  success: 4000,
  info: 5000,
  error: 8000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((items) => [...items.slice(-4), { id, type, message, title }]);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-md flex-col gap-3"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  dismiss,
}: {
  toast: Toast;
  dismiss: (id: number) => void;
}) {
  useEffect(() => {
    const ms = DURATION[toast.type];
    const timeout = window.setTimeout(() => dismiss(toast.id), ms);
    return () => window.clearTimeout(timeout);
  }, [dismiss, toast.id, toast.type]);

  const Icon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "error"
        ? CircleAlert
        : Info;

  const colors =
    toast.type === "success"
      ? "border-green-300 bg-green-50 text-green-900 shadow-green-900/10"
      : toast.type === "error"
        ? "border-red-300 bg-red-50 text-red-900 shadow-red-900/10"
        : "border-color4 bg-color3 text-color5 shadow-color5/10";

  const lines = toast.message.split("\n");
  const hasFirstLineTitle =
    lines.length > 1 &&
    !lines[0].startsWith("Penyebab:") &&
    !lines[0].startsWith("Solusi:");

  const displayTitle =
    toast.title ??
    (hasFirstLineTitle
      ? lines[0]
      : toast.type === "error"
        ? "Gagal Memproses Data"
        : toast.type === "success"
          ? "Berhasil"
          : undefined);

  const contentLines = hasFirstLineTitle ? lines.slice(1) : lines;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ${colors}`}
    >
      <Icon size={22} className="mt-0.5 shrink-0" />
      <div className="flex-1 text-sm leading-relaxed">
        {displayTitle && (
          <h4 className="font-extrabold text-base tracking-tight mb-1 text-inherit">
            {displayTitle}
          </h4>
        )}
        {contentLines.map((line, index) => (
          <p key={index} className={index > 0 ? "mt-1.5" : ""}>
            {line}
          </p>
        ))}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Tutup notifikasi"
        className="rounded-lg p-1 opacity-70 transition hover:bg-black/10 hover:opacity-100 shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast harus digunakan di dalam ToastProvider.");
  return context;
}
