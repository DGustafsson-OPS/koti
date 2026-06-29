import { Callout } from "@/components/ui";
import type { EnergyInsight } from "@/lib/energy-analytics";

export function EnergyInsights({ insights }: { insights: EnergyInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {insights.map((insight) => (
        <Callout
          key={insight.message}
          variant={insight.variant === "warning" ? "warning" : "info"}
        >
          {insight.message}
        </Callout>
      ))}
    </div>
  );
}
