import type { KotiakkuMeasurement } from "@/lib/kotiakku";
import {
  formatPercent,
  formatPowerKw,
  formatSpotPrice,
  hasSolarArrayData,
} from "@/lib/kotiakku";
import { Panel, StatCard } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/types";
import { EnergyLineChart } from "./energy-line-chart";
import { EnergySpotPrices } from "./energy-spot-prices";
import { EnergyAnalyticsPanel } from "./energy-analytics-panel";
import { EnergyInsights } from "./energy-insights";
import {
  chartPoints,
  buildEnergyInsights,
  type EnergySummary,
} from "@/lib/energy-analytics";
import type { SpotPriceSlot } from "@/lib/porssisahko";

function formatPeriod(iso: string, locale: Locale) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(locale === "fi" ? "fi-FI" : locale === "sv" ? "sv-FI" : "en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function KotiakkuSnapshot({
  latest,
  history,
  spotSlots,
  summary,
  locale,
  dict,
}: {
  latest: KotiakkuMeasurement;
  history: KotiakkuMeasurement[];
  spotSlots: SpotPriceSlot[];
  summary: EnergySummary;
  locale: Locale;
  dict: Dictionary;
}) {
  const k = dict.kotiakku;
  const insights = buildEnergyInsights(latest, summary, {
    lowSoc: k.insightLowSoc,
    highImportCost: k.insightHighImport,
    goodSelfSufficiency: k.insightGoodSelfSufficiency,
    exportingNow: k.insightExporting,
    dataGap: k.insightDataGap,
  });

  return (
    <div className="space-y-8">
      <EnergyInsights insights={insights} />

      <Panel title={k.currentStatus}>
        <p className="text-xs text-stone-400 mb-5">
          {k.period}: {formatPeriod(latest.periodStart, locale)} – {formatPeriod(latest.periodEnd, locale)}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label={k.batterySoc} value={formatPercent(latest.stateOfChargePercent, locale)} />
          <StatCard label={k.housePower} value={formatPowerKw(latest.housePowerKw, locale)} />
          <StatCard label={k.solarPower} value={formatPowerKw(latest.solarPowerKw, locale)} />
          <StatCard label={k.gridPower} value={formatPowerKw(latest.gridPowerKw, locale)} />
          <StatCard label={k.batteryPower} value={formatPowerKw(latest.batteryPowerKw, locale)} />
          <StatCard label={k.spotPrice} value={formatSpotPrice(latest.spotPriceCentsPerKwh, locale)} />
          {latest.totalPriceCentsPerKwh != null && (
            <StatCard
              label={k.totalPrice}
              value={formatSpotPrice(latest.totalPriceCentsPerKwh, locale)}
            />
          )}
          {latest.batteryTemperatureCelsius != null && (
            <StatCard
              label={k.batteryTemp}
              value={`${latest.batteryTemperatureCelsius.toLocaleString(locale, { maximumFractionDigits: 1 })} °C`}
            />
          )}
          {latest.batteryLossKw != null && latest.batteryLossKw > 0 && (
            <StatCard label={k.batteryLossNow} value={formatPowerKw(latest.batteryLossKw, locale)} />
          )}
        </div>
      </Panel>

      <EnergyAnalyticsPanel summary={summary} locale={locale} dict={dict} />

      <div className="grid lg:grid-cols-2 gap-6">
        <EnergySpotPrices
          title={k.spotPricesTitle}
          subtitle={k.spotPricesHelp}
          slots={spotSlots}
          locale={locale}
        />
        <EnergyLineChart
          title={k.chartSoc}
          points={chartPoints(history, (row) => row.stateOfChargePercent)}
          unit="%"
          locale={locale}
          color="#15803d"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <EnergyLineChart
          title={k.chartHouseSolar}
          points={chartPoints(history, (row) => row.housePowerKw)}
          unit="kW"
          locale={locale}
          color="#44403c"
        />
        <EnergyLineChart
          title={k.chartSolar}
          points={chartPoints(history, (row) => row.solarPowerKw)}
          unit="kW"
          locale={locale}
          color="#ca8a04"
        />
      </div>

      <EnergyLineChart
        title={k.chartGrid}
        points={chartPoints(history, (row) => row.gridPowerKw)}
        unit="kW"
        locale={locale}
        color="#2563eb"
        maxPoints={120}
      />

      {hasSolarArrayData(latest) && (
        <Panel title={k.solarArrays}>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              [k.solarArray1, latest.solarArray1PowerKw],
              [k.solarArray2, latest.solarArray2PowerKw],
              [k.solarArray3, latest.solarArray3PowerKw],
              [k.solarArray4, latest.solarArray4PowerKw],
            ]
              .filter(([, value]) => value != null)
              .map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex justify-between gap-4 px-4 py-3 rounded-xl bg-canvas-subtle/60 border border-stone-200/60"
                >
                  <span className="text-stone-600">{label}</span>
                  <span className="font-medium text-stone-900 tabular-nums">
                    {formatPowerKw(value as number | null, locale)}
                  </span>
                </div>
              ))}
          </div>
        </Panel>
      )}

      <Panel title={k.flows}>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            [k.solarToHouse, latest.solarToHouseKw],
            [k.solarToBattery, latest.solarToBatteryKw],
            [k.solarToGrid, latest.solarToGridKw],
            [k.gridToHouse, latest.gridToHouseKw],
            [k.gridToBattery, latest.gridToBatteryKw],
            [k.batteryToHouse, latest.batteryToHouseKw],
            [k.batteryToGrid, latest.batteryToGridKw],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex justify-between gap-4 px-4 py-3 rounded-xl bg-canvas-subtle/60 border border-stone-200/60"
            >
              <span className="text-stone-600">{label}</span>
              <span className="font-medium text-stone-900 tabular-nums">
                {formatPowerKw(value as number | null, locale)}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {history.length > 1 && (
        <Panel title={k.recentHistory}>
          <p className="text-sm text-stone-500 mb-4">{k.recentHistoryHelp}</p>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-stone-500 border-b border-stone-200">
                  <th className="py-2 px-2 font-medium">{k.time}</th>
                  <th className="py-2 px-2 font-medium">{k.batterySoc}</th>
                  <th className="py-2 px-2 font-medium">{k.housePower}</th>
                  <th className="py-2 px-2 font-medium">{k.solarPower}</th>
                  <th className="py-2 px-2 font-medium">{k.gridPower}</th>
                  <th className="py-2 px-2 font-medium">{k.spotPrice}</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().slice(0, 48).map((row) => (
                  <tr key={row.periodStart} className="border-b border-stone-100 last:border-0">
                    <td className="py-2 px-2 text-stone-600 whitespace-nowrap">
                      {formatPeriod(row.periodStart, locale)}
                    </td>
                    <td className="py-2 px-2 tabular-nums">{formatPercent(row.stateOfChargePercent, locale)}</td>
                    <td className="py-2 px-2 tabular-nums">{formatPowerKw(row.housePowerKw, locale)}</td>
                    <td className="py-2 px-2 tabular-nums">{formatPowerKw(row.solarPowerKw, locale)}</td>
                    <td className="py-2 px-2 tabular-nums">{formatPowerKw(row.gridPowerKw, locale)}</td>
                    <td className="py-2 px-2 tabular-nums">{formatSpotPrice(row.spotPriceCentsPerKwh, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
