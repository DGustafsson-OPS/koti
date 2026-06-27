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
import {
  getDictionary,
  entityTypeLabel,
  interpolate,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; property?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { q, property } = await searchParams;
  const results = q ? await searchAll(q, property) : [];

  return (
    <PageContainer size="narrow">
      <PageHeader title={dict.search.title} subtitle={dict.search.subtitle} />

      <form className="mb-8">
        <SearchInput
          name="q"
          defaultValue={q ?? ""}
          placeholder={dict.search.placeholder}
          autoFocus
        />
      </form>

      {!q && (
        <Panel className="text-sm text-stone-500">
          <p className="font-medium text-stone-700 mb-3">{dict.search.trySearching}</p>
          <ul className="space-y-2">
            {dict.search.examples.map((example) => (
              <li key={example}>
                <Link
                  href={`/search?q=${encodeURIComponent(example)}`}
                  className="text-brand-700 hover:underline"
                >
                  {example}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {q && results.length === 0 && (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          message={interpolate(dict.search.noResults, { q: q ?? "" })}
        />
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500 mb-1">
            {interpolate(
              results.length === 1 ? dict.common.result : dict.common.results,
              { n: results.length }
            )}
          </p>
          {results.map((r) => (
            <Card key={`${r.type}-${r.id}`} href={r.href} padding="sm" className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-stone-900">{r.title}</p>
                {r.subtitle && <p className="text-xs text-stone-500 mt-0.5">{r.subtitle}</p>}
              </div>
              <Badge variant="blue">{entityTypeLabel(dict, r.type)}</Badge>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
