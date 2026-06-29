import { Panel, StatCard } from "@/components/ui";
import type { EnergySummary } from "@/lib/energy-analytics";
import { formatEnergyKwh, formatEuros } from "@/lib/energy-analytics";
import { formatSpotPrice } from "@/lib/kotiakku";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/types";

export function EnergyAnalyticsPanel({
  summary,
  locale,
  dict,
}: {
  summary: EnergySummary;
  locale: Locale;
  dict: Dictionary;
}) {
  const k = dict.kotiakku;

  return (
    <Panel title={k.analyticsTitle}>
      <p className="text-sm text-stone-500 mb-5">{k.analyticsHelp}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          label={k.houseConsumption}
          value={formatEnergyKwh(summary.houseKwh, locale)}
        />
        <StatCard label={k.solarProduction} value={formatEnergyKwh(summary.solarKwh, locale)} />
        <StatCard
          label={k.selfSufficiency}
          value={
            summary.selfSufficiencyPercent != null
              ? `${summary.selfSufficiencyPercent.toLocaleString(locale, { maximumFractionDigits: 0 })}%`
              : "—"
          }
        />
        <StatCard
          label={k.gridImport}
          value={formatEnergyKwh(summary.gridImportKwh, locale)}
        />
        <StatCard
          label={k.gridExport}
          value={formatEnergyKwh(summary.gridExportKwh, locale)}
        />
        <StatCard label={k.importCost} value={formatEuros(summary.importCostEur, locale)} />
        <StatCard label={k.exportRevenue} value={formatEuros(summary.exportRevenueEur, locale)} />
        <StatCard label={k.netCost} value={formatEuros(summary.netCostEur, locale)} />
        <StatCard label={k.batterySavings} value={formatEuros(summary.batterySavingsEur, locale)} />
        {summary.avgSpotPrice != null && (
          <StatCard
            label={k.avgSpotPrice}
            value={formatSpotPrice(summary.avgSpotPrice, locale)}
          />
        )}
        {summary.avgImportPrice != null && (
          <StatCard
            label={k.avgImportPrice}
            value={formatSpotPrice(summary.avgImportPrice, locale)}
          />
        )}
        {summary.batteryLossKwh > 0 && (
          <StatCard
            label={k.batteryLoss}
            value={formatEnergyKwh(summary.batteryLossKwh, locale)}
          />
        )}
      </div>
    </Panel>
  );
}
