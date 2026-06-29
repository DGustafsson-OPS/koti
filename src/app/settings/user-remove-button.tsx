"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useI18n } from "@/components/locale-provider";

export function UserRemoveButton({
  userId,
  label,
  confirmMessage,
  action,
}: {
  userId: string;
  label: string;
  confirmMessage: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="text-xs text-red-600"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={dict.common.confirmTitle}
        message={confirmMessage}
        confirmLabel={label}
        cancelLabel={dict.common.cancel}
        pending={pending}
        onConfirm={() => {
          startTransition(async () => {
            const formData = new FormData();
            formData.set("userId", userId);
            await action(formData);
            setOpen(false);
          });
        }}
      />
    </>
  );
}
