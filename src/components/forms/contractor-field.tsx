"use client";

import { Input, Select } from "@/components/ui";
import type { Contractor } from "@/db/schema";
import { useI18n } from "@/components/locale-provider";

export function ContractorField({
  contractors,
  defaultContractorId,
  defaultContractorName,
}: {
  contractors: Contractor[];
  defaultContractorId?: string | null;
  defaultContractorName?: string | null;
}) {
  const { dict } = useI18n();
  const f = dict.forms;

  return (
    <div className="space-y-3">
      {contractors.length > 0 && (
        <Select
          label={f.contractorFromRegistry}
          name="contractorId"
          defaultValue={defaultContractorId ?? ""}
        >
          <option value="">{dict.common.none}</option>
          {contractors.map((contractor) => (
            <option key={contractor.id} value={contractor.id}>
              {contractor.name}
              {contractor.specialty ? ` · ${contractor.specialty}` : ""}
            </option>
          ))}
        </Select>
      )}
      <Input
        label={contractors.length > 0 ? f.contractorOther : f.contractor}
        name="contractor"
        defaultValue={!defaultContractorId ? (defaultContractorName ?? "") : ""}
        placeholder={dict.tasks.contractorPlaceholder}
      />
    </div>
  );
}
