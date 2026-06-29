import type { SpotPriceSlot } from "@/lib/porssisahko";
import { formatSpotPrice } from "@/lib/kotiakku";

export function EnergySpotPrices({
  title,
  subtitle,
  slots,
  locale,
}: {
  title: string;
  subtitle: string;
  slots: SpotPriceSlot[];
  locale: string;
}) {
  const sorted = [...slots].sort(
    (a, b) => Date.parse(a.startDate) - Date.parse(b.startDate)
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-surface p-5">
        <h3 className="font-medium text-stone-900">{title}</h3>
        <p className="text-sm text-stone-500 mt-2">—</p>
      </div>
    );
  }

  const prices = sorted.map((slot) => slot.priceCentsPerKwh);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const now = Date.now();

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-surface p-5">
      <h3 className="font-medium text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500 mt-1 mb-4">{subtitle}</p>
      <div className="flex items-end gap-px h-32 overflow-x-auto pb-1">
        {sorted.map((slot) => {
          const height = ((slot.priceCentsPerKwh - min) / span) * 100;
          const isNow =
            now >= Date.parse(slot.startDate) && now <= Date.parse(slot.endDate);
          const time = new Date(slot.startDate).toLocaleTimeString(
            locale === "fi" ? "fi-FI" : locale === "sv" ? "sv-FI" : "en-GB",
            { hour: "2-digit", minute: "2-digit" }
          );
          return (
            <div
              key={slot.startDate}
              className="flex flex-col items-center min-w-[10px] flex-1"
              title={`${time}: ${formatSpotPrice(slot.priceCentsPerKwh, locale)}`}
            >
              <div
                className={`w-full rounded-t ${isNow ? "bg-brand-600" : "bg-brand-300"}`}
                style={{ height: `${Math.max(height, 8)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-stone-400 mt-3 tabular-nums">
        <span>{formatSpotPrice(min, locale)}</span>
        <span>{formatSpotPrice(max, locale)}</span>
      </div>
    </div>
  );
}
