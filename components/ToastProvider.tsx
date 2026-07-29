"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; message: string };
type ToastContextValue = { showToast: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextValue | null>(null);
const AUTO_CLOSE_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((items) => [...items.slice(-3), { id, type, message }]);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-md flex-col gap-3">
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: number) => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => dismiss(toast.id), AUTO_CLOSE_MS);
    return () => window.clearTimeout(timeout);
  }, [dismiss, toast.id]);

  const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? CircleAlert : Info;
  const colors = toast.type === "success" ? "border-green-200 bg-green-50 text-green-800" : toast.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-color4 bg-color3 text-color5";

  return <div role="status" className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${colors}`}><Icon size={21} className="mt-0.5 shrink-0" /><p className="flex-1 text-sm font-semibold leading-5">{toast.message}</p><button type="button" onClick={() => dismiss(toast.id)} aria-label="Tutup notifikasi" className="rounded-md p-0.5 opacity-70 transition hover:bg-black/10 hover:opacity-100"><X size={17} /></button></div>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast harus digunakan di dalam ToastProvider.");
  return context;
}
