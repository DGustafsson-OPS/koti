import { Zap } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatPercent, formatPowerKw, formatSpotPrice } from "@/lib/kotiakku";
import { currentSpotPrice } from "@/lib/porssisahko";
import type { SpotPriceSlot } from "@/lib/porssisahko";
import type { KotiakkuMeasurement } from "@/lib/kotiakku";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/types";

export function DashboardEnergyCard({
  propertyId,
  propertyName,
  latest,
  spotSlots,
  locale,
  dict,
}: {
  propertyId: string;
  propertyName: string;
  latest: KotiakkuMeasurement;
  spotSlots: SpotPriceSlot[];
  locale: Locale;
  dict: Dictionary;
}) {
  const k = dict.kotiakku;
  const d = dict.dashboard;
  const spot = currentSpotPrice(spotSlots);

  return (
    <Card href={`/energy?property=${propertyId}`} padding="sm" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-stone-900">{d.energyTitle}</p>
            <p className="text-xs text-stone-500">{propertyName}</p>
          </div>
        </div>
        <Badge variant="blue">{k.statusConnected}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-stone-500 text-xs">{k.batterySoc}</p>
          <p className="font-medium tabular-nums">{formatPercent(latest.stateOfChargePercent, locale)}</p>
        </div>
        <div>
          <p className="text-stone-500 text-xs">{k.solarPower}</p>
          <p className="font-medium tabular-nums">{formatPowerKw(latest.solarPowerKw, locale)}</p>
        </div>
        <div>
          <p className="text-stone-500 text-xs">{k.housePower}</p>
          <p className="font-medium tabular-nums">{formatPowerKw(latest.housePowerKw, locale)}</p>
        </div>
        <div>
          <p className="text-stone-500 text-xs">{k.spotPriceNow}</p>
          <p className="font-medium tabular-nums">
            {spot ? formatSpotPrice(spot.priceCentsPerKwh, locale) : formatSpotPrice(latest.spotPriceCentsPerKwh, locale)}
          </p>
        </div>
      </div>
      <p className="text-xs text-brand-700 font-medium">{d.viewEnergy} →</p>
    </Card>
  );
}
