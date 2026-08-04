"use client";

import { AlertTriangle, Info, Trash2, X } from "lucide-react";
import { useEffect } from "react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const Icon = variant === "danger" ? Trash2 : variant === "warning" ? AlertTriangle : Info;
  
  const iconBgClass =
    variant === "danger"
      ? "bg-red-100 text-red-600"
      : variant === "warning"
      ? "bg-amber-100 text-amber-600"
      : "bg-color4 text-color1";

  const btnConfirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : variant === "warning"
      ? "bg-amber-600 hover:bg-amber-700 text-white"
      : "bg-color1 hover:bg-color1/90 text-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-color5/60 p-0 sm:p-4 backdrop-blur-xs transition-opacity"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-color4/80 bg-color3 p-6 shadow-2xl transition-all sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${iconBgClass}`}>
            <Icon size={24} />
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-xl p-1.5 text-color5/50 hover:bg-color4/60 hover:text-color5 transition disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4">
          <h3 id="confirm-modal-title" className="text-xl font-bold text-color5">
            {title}
          </h3>
          <p id="confirm-modal-desc" className="mt-2 text-sm leading-relaxed text-color5/75">
            {message}
          </p>
        </div>

        <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-color4/60 pt-5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="h-11 w-full sm:w-auto rounded-xl border border-color4 px-5 font-bold text-color5 transition hover:bg-color4/40 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`h-11 w-full sm:w-auto rounded-xl px-5 font-bold shadow-xs transition disabled:opacity-50 ${btnConfirmClass}`}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
