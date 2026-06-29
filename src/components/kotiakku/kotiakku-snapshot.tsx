import type { KotiakkuMeasurement } from "@/lib/kotiakku";
import {
  formatPercent,
  formatPowerKw,
  formatSpotPrice,
} from "@/lib/kotiakku";
import { Panel, StatCard } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/types";

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
  locale,
  dict,
}: {
  latest: KotiakkuMeasurement;
  history: KotiakkuMeasurement[];
  locale: Locale;
  dict: Dictionary;
}) {
  const k = dict.kotiakku;

  return (
    <div className="space-y-8">
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
          {latest.batteryTemperatureCelsius != null && (
            <StatCard
              label={k.batteryTemp}
              value={`${latest.batteryTemperatureCelsius.toLocaleString(locale, { maximumFractionDigits: 1 })} °C`}
            />
          )}
        </div>
      </Panel>

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
            <table className="w-full text-sm min-w-[640px]">
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
                {[...history].reverse().map((row) => (
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
