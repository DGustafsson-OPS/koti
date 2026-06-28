import Link from "next/link";
import { Search } from "lucide-react";
import { searchAll, getProperties } from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Badge,
  EmptyState,
  SearchInput,
  Panel,
  PropertyTabs,
  FilterTabs,
} from "@/components/ui";
import {
  getDictionary,
  entityTypeLabel,
  interpolate,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { queryUrl } from "@/lib/query-url";

const SEARCH_TYPE_KEYS = ["property", "room", "material", "asset", "task", "event", "file"] as const;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; property?: string; type?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { q, property, type } = await searchParams;
  const properties = await getProperties();
  const activePropertyId = property ?? properties[0]?.id;
  const results = q ? await searchAll(q, activePropertyId, type) : [];

  const filterParams = { q, property: activePropertyId };

  return (
    <PageContainer size="wide">
      <PageHeader title={dict.search.title} subtitle={dict.search.subtitle} />

      <PropertyTabs
        properties={properties}
        activeId={activePropertyId}
        basePath="/search"
        params={{ q, type }}
      />

      <form className="mb-6">
        <SearchInput
          name="q"
          defaultValue={q ?? ""}
          placeholder={dict.search.placeholder}
          autoFocus
        />
        {activePropertyId && <input type="hidden" name="property" value={activePropertyId} />}
        {type && <input type="hidden" name="type" value={type} />}
      </form>

      {q && (
        <FilterTabs
          items={[
            { key: "all", label: dict.search.allTypes },
            ...SEARCH_TYPE_KEYS.map((key) => ({
              key,
              label: entityTypeLabel(dict, key),
            })),
          ]}
          activeKey={type ?? "all"}
          basePath="/search"
          paramName="type"
          params={filterParams}
        />
      )}

      {!q && (
        <Panel className="text-sm text-stone-500">
          <p className="font-medium text-stone-700 mb-3">{dict.search.trySearching}</p>
          <ul className="space-y-2">
            {dict.search.examples.map((example) => (
              <li key={example}>
                <Link
                  href={queryUrl("/search", {
                    q: example,
                    property: activePropertyId,
                  })}
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
