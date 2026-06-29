"use client";

import { useEffect, useId } from "react";
import { Button } from "@/components/ui";

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  pending = false,
  confirmVariant = "danger",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  confirmVariant?: "danger" | "primary";
}) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, pending, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
        aria-label={cancelLabel}
        disabled={pending}
        onClick={() => !pending && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-md bg-surface border border-stone-200/80 rounded-2xl shadow-xl shadow-stone-900/10 p-6"
      >
        <p id={titleId} className="font-display text-lg font-semibold text-stone-900">
          {title}
        </p>
        <p id={descId} className="text-sm text-stone-600 mt-2 leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" disabled={pending} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
