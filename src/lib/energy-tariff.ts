import type { Property } from "@/db/schema";

/** Per-property spot electricity tariff (all fees in c/kWh, incl. VAT where applicable). */
export type EnergyTariff = {
  spotMarginCents: number;
  importTransferCents: number;
  electricityTaxCents: number;
  exportTransferCents: number;
};

/** Typical Finnish spot-contract defaults — user should adjust to match their bill. */
export const DEFAULT_ENERGY_TARIFF: EnergyTariff = {
  spotMarginCents: 0.5,
  importTransferCents: 5.26,
  electricityTaxCents: 2.25,
  exportTransferCents: 0.83,
};

export function tariffFromProperty(
  property: Pick<
    Property,
    | "energySpotMarginCents"
    | "energyImportTransferCents"
    | "energyElectricityTaxCents"
    | "energyExportTransferCents"
  >
): EnergyTariff {
  return {
    spotMarginCents: property.energySpotMarginCents ?? DEFAULT_ENERGY_TARIFF.spotMarginCents,
    importTransferCents:
      property.energyImportTransferCents ?? DEFAULT_ENERGY_TARIFF.importTransferCents,
    electricityTaxCents:
      property.energyElectricityTaxCents ?? DEFAULT_ENERGY_TARIFF.electricityTaxCents,
    exportTransferCents:
      property.energyExportTransferCents ?? DEFAULT_ENERGY_TARIFF.exportTransferCents,
  };
}

export function importPriceCentsPerKwh(spotCents: number, tariff: EnergyTariff): number {
  return (
    spotCents +
    tariff.spotMarginCents +
    tariff.importTransferCents +
    tariff.electricityTaxCents
  );
}

export function exportPriceCentsPerKwh(spotCents: number, tariff: EnergyTariff): number {
  return Math.max(0, spotCents - tariff.exportTransferCents);
}

export function parseTariffForm(formData: FormData): EnergyTariff {
  const num = (name: string) => {
    const raw = String(formData.get(name) ?? "").trim().replace(",", ".");
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  };

  return {
    spotMarginCents: num("spotMarginCents"),
    importTransferCents: num("importTransferCents"),
    electricityTaxCents: num("electricityTaxCents"),
    exportTransferCents: num("exportTransferCents"),
  };
}
