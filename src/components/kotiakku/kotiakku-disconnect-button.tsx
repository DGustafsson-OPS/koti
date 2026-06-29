"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useI18n } from "@/components/locale-provider";
import { disconnectKotiakkuAction } from "@/app/energy/actions";

export function KotiakkuDisconnectButton({ propertyId }: { propertyId: string }) {
  const { dict } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => setOpen(true)}>
        {dict.kotiakku.disconnect}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={dict.common.confirmTitle}
        message={dict.kotiakku.disconnectConfirm}
        confirmLabel={dict.kotiakku.disconnect}
        cancelLabel={dict.common.cancel}
        pending={pending}
        onConfirm={() => {
          startTransition(async () => {
            await disconnectKotiakkuAction(propertyId);
            setOpen(false);
            router.refresh();
          });
        }}
      />
    </>
  );
}
