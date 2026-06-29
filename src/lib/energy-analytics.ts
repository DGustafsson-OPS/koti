import type { KotiakkuMeasurement } from "@/lib/kotiakku";
import { spotPriceAt, type SpotPriceSlot } from "@/lib/porssisahko";
import {
  importPriceCentsPerKwh,
  exportPriceCentsPerKwh,
  type EnergyTariff,
  DEFAULT_ENERGY_TARIFF,
} from "@/lib/energy-tariff";

export type EnergyRange = "24h" | "7d" | "30d";

export function energyRangeHours(range: EnergyRange): number {
  switch (range) {
    case "24h":
      return 24;
    case "7d":
      return 24 * 7;
    case "30d":
      return 24 * 30;
  }
}

export function parseEnergyRange(value: string | undefined): EnergyRange {
  if (value === "7d" || value === "30d") return value;
  return "24h";
}

export function periodHours(measurement: KotiakkuMeasurement): number {
  const start = Date.parse(measurement.periodStart);
  const end = Date.parse(measurement.periodEnd);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 5 / 60;
  return (end - start) / 3_600_000;
}

export function kwToKwh(kw: number | null | undefined, hours: number): number {
  if (kw == null) return 0;
  return kw * hours;
}

function priceForMeasurement(
  measurement: KotiakkuMeasurement,
  spotSlots: SpotPriceSlot[]
): number | null {
  if (measurement.spotPriceCentsPerKwh != null) return measurement.spotPriceCentsPerKwh;
  const midpoint = new Date(
    (Date.parse(measurement.periodStart) + Date.parse(measurement.periodEnd)) / 2
  ).toISOString();
  return spotPriceAt(spotSlots, midpoint);
}

export type EnergySummary = {
  houseKwh: number;
  solarKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  solarToHouseKwh: number;
  batteryToHouseKwh: number;
  batteryLossKwh: number;
  selfSufficiencyPercent: number | null;
  importCostEur: number;
  exportRevenueEur: number;
  netCostEur: number;
  batterySavingsEur: number;
  avgSpotPrice: number | null;
  avgImportPrice: number | null;
};

export function summarizeEnergy(
  history: KotiakkuMeasurement[],
  spotSlots: SpotPriceSlot[] = [],
  tariff: EnergyTariff = DEFAULT_ENERGY_TARIFF
): EnergySummary {
  let houseKwh = 0;
  let solarKwh = 0;
  let gridImportKwh = 0;
  let gridExportKwh = 0;
  let solarToHouseKwh = 0;
  let batteryToHouseKwh = 0;
  let batteryLossKwh = 0;
  let importCostEur = 0;
  let exportRevenueEur = 0;
  let batterySavingsEur = 0;
  let spotSum = 0;
  let spotCount = 0;
  let importPriceSum = 0;
  let importPriceCount = 0;

  for (const row of history) {
    const hours = periodHours(row);
    const price = priceForMeasurement(row, spotSlots);

    houseKwh += kwToKwh(row.housePowerKw, hours);
    solarKwh += kwToKwh(row.solarPowerKw, hours);

    const importKw = (row.gridToHouseKw ?? 0) + (row.gridToBatteryKw ?? 0);
    const exportKw = (row.solarToGridKw ?? 0) + (row.batteryToGridKw ?? 0);
    const importKwh = kwToKwh(importKw, hours);
    const exportKwh = kwToKwh(exportKw, hours);
    const solarHouseKwh = kwToKwh(row.solarToHouseKw, hours);
    const batteryHouseKwh = kwToKwh(row.batteryToHouseKw, hours);

    gridImportKwh += importKwh;
    gridExportKwh += exportKwh;
    solarToHouseKwh += solarHouseKwh;
    batteryToHouseKwh += batteryHouseKwh;
    batteryLossKwh += kwToKwh(row.batteryLossKw, hours);

    if (price != null) {
      const importPrice = importPriceCentsPerKwh(price, tariff);
      const exportPrice = exportPriceCentsPerKwh(price, tariff);
      importCostEur += (importKwh * importPrice) / 100;
      exportRevenueEur += (exportKwh * exportPrice) / 100;
      batterySavingsEur += (batteryHouseKwh * importPrice) / 100;
      spotSum += price;
      spotCount++;
      if (importKwh > 0) {
        importPriceSum += importPrice;
        importPriceCount++;
      }
    }
  }

  const selfSufficiencyPercent =
    houseKwh > 0 ? ((solarToHouseKwh + batteryToHouseKwh) / houseKwh) * 100 : null;

  const avgImportPrice =
    gridImportKwh > 0 ? (importCostEur / gridImportKwh) * 100 : importPriceCount > 0 ? importPriceSum / importPriceCount : null;

  return {
    houseKwh,
    solarKwh,
    gridImportKwh,
    gridExportKwh,
    solarToHouseKwh,
    batteryToHouseKwh,
    batteryLossKwh,
    selfSufficiencyPercent,
    importCostEur,
    exportRevenueEur,
    netCostEur: importCostEur - exportRevenueEur,
    batterySavingsEur,
    avgSpotPrice: spotCount > 0 ? spotSum / spotCount : null,
    avgImportPrice,
  };
}

export type ChartPoint = { label: string; value: number };

export function chartPoints(
  history: KotiakkuMeasurement[],
  pick: (row: KotiakkuMeasurement) => number | null
): ChartPoint[] {
  return history
    .map((row) => {
      const value = pick(row);
      if (value == null) return null;
      return {
        label: row.periodStart,
        value,
      };
    })
    .filter((point): point is ChartPoint => point != null);
}

export type EnergyInsight = {
  variant: "warning" | "info" | "success";
  message: string;
};

export function buildEnergyInsights(
  latest: KotiakkuMeasurement | null,
  summary: EnergySummary,
  dict: {
    lowSoc: string;
    highImportCost: string;
    goodSelfSufficiency: string;
    exportingNow: string;
    dataGap: string;
  }
): EnergyInsight[] {
  const insights: EnergyInsight[] = [];

  if (!latest) return insights;

  const allNull =
    latest.housePowerKw == null &&
    latest.solarPowerKw == null &&
    latest.gridPowerKw == null &&
    latest.batteryPowerKw == null;
  if (allNull) {
    insights.push({ variant: "warning", message: dict.dataGap });
  }

  if (latest.stateOfChargePercent != null && latest.stateOfChargePercent < 20) {
    insights.push({ variant: "warning", message: dict.lowSoc });
  }

  if (summary.selfSufficiencyPercent != null && summary.selfSufficiencyPercent >= 70) {
    insights.push({ variant: "success", message: dict.goodSelfSufficiency });
  }

  if (summary.netCostEur > 5 && summary.importCostEur > summary.exportRevenueEur * 2) {
    insights.push({ variant: "info", message: dict.highImportCost });
  }

  const exportNow =
    (latest.solarToGridKw ?? 0) + (latest.batteryToGridKw ?? 0) > 0.2;
  if (exportNow) {
    insights.push({ variant: "info", message: dict.exportingNow });
  }

  return insights;
}

export function formatEnergyKwh(value: number, locale: string): string {
  return `${value.toLocaleString(locale, { maximumFractionDigits: 1 })} kWh`;
}

export function formatEuros(value: number, locale: string): string {
  return `${value.toLocaleString(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 2 })}`;
}
