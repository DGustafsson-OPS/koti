import { Badge } from "@/components/ui";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/types";

export function EnergyPropertyHeader({
  propertyName,
  propertyAddress,
  connected,
  dict,
}: {
  propertyName: string;
  propertyAddress?: string | null;
  connected: boolean;
  dict: Dictionary;
}) {
  const k = dict.kotiakku;

  return (
    <div className="mb-6 rounded-2xl border border-stone-200/80 bg-surface px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm shadow-stone-200/30">
      <div>
        <p className="font-display text-xl font-semibold text-stone-900 tracking-tight">
          {interpolate(k.batteryFor, { name: propertyName })}
        </p>
        {propertyAddress && (
          <p className="text-sm text-stone-500 mt-1">{propertyAddress}</p>
        )}
      </div>
      <Badge variant={connected ? "green" : "default"}>
        {connected ? k.statusConnected : k.statusNotConnected}
      </Badge>
    </div>
  );
}
