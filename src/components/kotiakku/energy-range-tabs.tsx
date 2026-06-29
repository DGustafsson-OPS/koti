import Link from "next/link";
import { queryUrl } from "@/lib/query-url";
import type { EnergyRange } from "@/lib/energy-analytics";

export function EnergyRangeTabs({
  active,
  propertyId,
  labels,
}: {
  active: EnergyRange;
  propertyId: string;
  labels: Record<EnergyRange, string>;
}) {
  const ranges: EnergyRange[] = ["24h", "7d", "30d"];

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {ranges.map((range) => (
        <Link
          key={range}
          href={queryUrl("/energy", { property: propertyId, range })}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            range === active
              ? "bg-brand-700 text-white shadow-sm"
              : "bg-surface text-stone-600 border border-stone-200 hover:border-brand-300 hover:text-brand-800"
          }`}
        >
          {labels[range]}
        </Link>
      ))}
    </div>
  );
}
