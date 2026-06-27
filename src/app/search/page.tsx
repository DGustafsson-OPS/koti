import Link from "next/link";
import { searchAll } from "@/lib/queries";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; property?: string }>;
}) {
  const { q, property } = await searchParams;
  const results = q ? await searchAll(q, property) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader title="Search" subtitle="Find anything about your home" />

      <form className="mb-8">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Kitchen paint, dishwasher manual, roof invoice..."
          className="w-full border border-stone-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
          autoFocus
        />
      </form>

      {!q && (
        <div className="text-sm text-stone-400 space-y-1">
          <p>Try searching for:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Kitchen paint</li>
            <li>Dishwasher manual</li>
            <li>Boiler warranty</li>
            <li>Contractor who fixed leak</li>
          </ul>
        </div>
      )}

      {q && results.length === 0 && (
        <EmptyState message={`No results for "${q}"`} />
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-stone-500 mb-3">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          {results.map((r) => (
            <Link key={`${r.type}-${r.id}`} href={r.href}>
              <Card className="p-3 flex items-center justify-between hover:border-brand-500">
                <div>
                  <p className="font-medium text-sm">{r.title}</p>
                  {r.subtitle && <p className="text-xs text-stone-400">{r.subtitle}</p>}
                </div>
                <Badge variant="blue">{r.type}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
