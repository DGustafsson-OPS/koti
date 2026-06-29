"use client";

import { useState } from "react";
import { Button, Input, Panel } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";
import type { EnergyTariff } from "@/lib/energy-tariff";

export function EnergyTariffForm({
  propertyId,
  tariff,
  saveAction,
}: {
  propertyId: string;
  tariff: EnergyTariff;
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const { dict } = useI18n();
  const t = dict.kotiakku.tariff;
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="secondary" className="mb-6" onClick={() => setOpen(true)}>
        {t.edit}
      </Button>
    );
  }

  return (
    <Panel title={t.title} className="mb-8">
      <p className="text-sm text-stone-500 mb-4">{t.help}</p>
      <form
        action={async (formData) => {
          formData.set("propertyId", propertyId);
          await saveAction(formData);
          setOpen(false);
        }}
        className="grid sm:grid-cols-2 gap-4"
      >
        <Input
          label={t.spotMargin}
          name="spotMarginCents"
          type="number"
          step="0.01"
          min="0"
          defaultValue={tariff.spotMarginCents}
          placeholder={t.spotMarginPlaceholder}
        />
        <Input
          label={t.importTransfer}
          name="importTransferCents"
          type="number"
          step="0.01"
          min="0"
          defaultValue={tariff.importTransferCents}
          placeholder={t.importTransferPlaceholder}
        />
        <Input
          label={t.electricityTax}
          name="electricityTaxCents"
          type="number"
          step="0.01"
          min="0"
          defaultValue={tariff.electricityTaxCents}
          placeholder={t.electricityTaxPlaceholder}
        />
        <Input
          label={t.exportTransfer}
          name="exportTransferCents"
          type="number"
          step="0.01"
          min="0"
          defaultValue={tariff.exportTransferCents}
          placeholder={t.exportTransferPlaceholder}
        />
        <div className="sm:col-span-2 flex gap-2">
          <Button type="submit" variant="secondary">
            {dict.common.save}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            {dict.common.cancel}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
