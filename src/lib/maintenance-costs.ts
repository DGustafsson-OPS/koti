import type { MaintenanceEvent } from "@/db/schema";

export function summarizeMaintenanceCosts(events: Pick<MaintenanceEvent, "cost" | "taxDeductible">[]) {
  let totalServiceCost = 0;
  let deductibleCost = 0;
  let entriesWithCost = 0;

  for (const event of events) {
    if (event.cost == null) continue;
    entriesWithCost++;
    totalServiceCost += event.cost;
    if (event.taxDeductible) deductibleCost += event.cost;
  }

  return { totalServiceCost, deductibleCost, entriesWithCost };
}

export function parseTaxDeductible(formData: FormData) {
  return formData.get("taxDeductible") === "on";
}
