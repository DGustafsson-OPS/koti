"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Panel } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";
import { interpolate } from "@/lib/i18n";
import { connectKotiakkuAction } from "@/app/energy/actions";

export function KotiakkuConnectForm({
  propertyId,
  propertyName,
}: {
  propertyId: string;
  propertyName: string;
}) {
  const { dict } = useI18n();
  const k = dict.kotiakku;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Panel title={k.connectTitle}>
      <p className="text-sm font-medium text-stone-700 mb-2">
        {interpolate(k.connectFor, { name: propertyName })}
      </p>
      <p className="text-sm text-stone-500 mb-5 leading-relaxed">{k.connectHelp}</p>
      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await connectKotiakkuAction(propertyId, formData);
            if (result?.error === "missing_key") {
              setError(k.errorMissingKey);
            } else if (result?.error === "invalid_key") {
              setError(k.errorInvalidKey);
            } else if (result?.error === "rate_limit") {
              setError(k.errorRateLimit);
            } else {
              router.refresh();
            }
          });
        }}
        className="space-y-4"
      >
        <Input
          label={k.apiKeyLabel}
          name="apiKey"
          type="password"
          autoComplete="off"
          placeholder={k.apiKeyPlaceholder}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? k.connecting : k.connectSubmit}
        </Button>
      </form>
    </Panel>
  );
}
