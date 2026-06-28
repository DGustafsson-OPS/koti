import { notFound } from "next/navigation";
import { getProperty } from "@/lib/queries";
import { importAssetsFromCsv, importTasksFromCsv } from "@/lib/import-actions";
import { PageContainer, PageHeader, ButtonLink } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { ImportCsvForm } from "./import-csv-form";

export default async function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  async function handleImportAssets(formData: FormData) {
    "use server";
    const csv = formData.get("csv") as string;
    return importAssetsFromCsv(id, csv);
  }

  async function handleImportTasks(formData: FormData) {
    "use server";
    const csv = formData.get("csv") as string;
    return importTasksFromCsv(id, csv);
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        title={dict.import.title}
        subtitle={dict.import.subtitle}
        back={{ href: `/properties/${id}`, label: property.name }}
      />

      <div className="flex flex-wrap gap-3 mb-8">
        <ButtonLink href={`/api/export/assets?property=${id}`} variant="secondary">
          {dict.import.exportAssets}
        </ButtonLink>
        <ButtonLink href={`/api/export/tasks?property=${id}`} variant="secondary">
          {dict.import.exportTasks}
        </ButtonLink>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ImportCsvForm
          label={dict.import.assetsTitle}
          help={dict.import.assetsHelp}
          columns={dict.import.assetsColumns}
          importAction={handleImportAssets}
        />
        <ImportCsvForm
          label={dict.import.tasksTitle}
          help={dict.import.tasksHelp}
          columns={dict.import.tasksColumns}
          importAction={handleImportTasks}
        />
      </div>
    </PageContainer>
  );
}
