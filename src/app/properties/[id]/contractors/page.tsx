import { notFound } from "next/navigation";
import { getProperty, getContractors } from "@/lib/queries";
import { PageContainer, PageHeader, Card, EmptyState, Panel, ButtonLink } from "@/components/ui";
import { CreateContractorForm } from "@/components/forms/create-contractor-form";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function ContractorsPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const contractorList = await getContractors(id);

  return (
    <PageContainer size="wide">
      <PageHeader
        title={dict.contractors.title}
        subtitle={dict.contractors.subtitle}
        back={{ href: `/properties/${id}`, label: property.name }}
      />

      <Panel title={dict.contractors.add} className="mb-8">
        <CreateContractorForm propertyId={id} />
      </Panel>

      {contractorList.length === 0 ? (
        <EmptyState message={dict.contractors.empty} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractorList.map((contractor) => (
            <Card key={contractor.id} href={`/contractors/${contractor.id}/edit`} padding="sm">
              <p className="font-medium text-stone-900">{contractor.name}</p>
              {contractor.specialty && (
                <p className="text-sm text-stone-500 mt-1">{contractor.specialty}</p>
              )}
              {(contractor.phone || contractor.email) && (
                <p className="text-xs text-stone-400 mt-2 space-y-0.5">
                  {contractor.phone && <span className="block">{contractor.phone}</span>}
                  {contractor.email && <span className="block">{contractor.email}</span>}
                </p>
              )}
              {contractor.notes && (
                <p className="text-xs text-stone-500 mt-2 line-clamp-2">{contractor.notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <ButtonLink href={`/history?property=${id}`} variant="secondary">
          {dict.contractors.viewHistory}
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
