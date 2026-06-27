import Link from "next/link";
import { Search } from "lucide-react";
import { searchAll } from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Badge,
  EmptyState,
  SearchInput,
  Panel,
} from "@/components/ui";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; property?: string }>;
}) {
  const { q, property } = await searchParams;
  const results = q ? await searchAll(q, property) : [];

  return (
    <PageContainer size="narrow">
      <PageHeader title="Search" subtitle="Find anything about your home" />

      <form className="mb-8">
        <SearchInput
          name="q"
          defaultValue={q ?? ""}
          placeholder="Kitchen paint, dishwasher, boiler warranty…"
          autoFocus
        />
      </form>

      {!q && (
        <Panel className="text-sm text-stone-500">
          <p className="font-medium text-stone-700 mb-3">Try searching for</p>
          <ul className="space-y-2">
            {["Kitchen paint", "Dishwasher manual", "Boiler warranty", "Contractor who fixed leak"].map(
              (example) => (
                <li key={example}>
                  <Link
                    href={`/search?q=${encodeURIComponent(example)}`}
                    className="text-brand-700 hover:underline"
                  >
                    {example}
                  </Link>
                </li>
              )
            )}
          </ul>
        </Panel>
      )}

      {q && results.length === 0 && (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          message={`No results for "${q}". Try a different keyword.`}
        />
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500 mb-1">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((r) => (
            <Card key={`${r.type}-${r.id}`} href={r.href} padding="sm" className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-stone-900">{r.title}</p>
                {r.subtitle && <p className="text-xs text-stone-500 mt-0.5">{r.subtitle}</p>}
              </div>
              <Badge variant="blue">{r.type}</Badge>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
