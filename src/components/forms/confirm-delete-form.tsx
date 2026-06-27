"use client";

import { Button } from "@/components/ui";

export function ConfirmDeleteForm({
  action,
  label,
  confirmMessage,
}: {
  action: () => void | Promise<void>;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form
      action={async () => {
        if (!confirm(confirmMessage)) return;
        await action();
      }}
    >
      <Button type="submit" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
        {label}
      </Button>
    </form>
  );
}
