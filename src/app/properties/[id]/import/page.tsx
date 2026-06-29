import { notFound } from "next/navigation";
import { getProperty } from "@/lib/queries";
import {
  importAssetsFromCsv,
  importTasksFromCsv,
  importRoomsFromCsv,
  importMaterialsFromCsv,
  importMaintenanceFromCsv,
} from "@/lib/import-actions";
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

  async function handleImportRooms(formData: FormData) {
    "use server";
    const csv = formData.get("csv") as string;
    return importRoomsFromCsv(id, csv);
  }

  async function handleImportMaterials(formData: FormData) {
    "use server";
    const csv = formData.get("csv") as string;
    return importMaterialsFromCsv(id, csv);
  }

  async function handleImportMaintenance(formData: FormData) {
    "use server";
    const csv = formData.get("csv") as string;
    return importMaintenanceFromCsv(id, csv);
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        title={dict.import.title}
        subtitle={dict.import.subtitle}
        back={{ href: `/properties/${id}`, label: property.name }}
      />

      <div className="flex flex-wrap gap-3 mb-8">
        <ButtonLink href={`/api/export/rooms?property=${id}`} variant="secondary">
          {dict.import.exportRooms}
        </ButtonLink>
        <ButtonLink href={`/api/export/materials?property=${id}`} variant="secondary">
          {dict.import.exportMaterials}
        </ButtonLink>
        <ButtonLink href={`/api/export/assets?property=${id}`} variant="secondary">
          {dict.import.exportAssets}
        </ButtonLink>
        <ButtonLink href={`/api/export/tasks?property=${id}`} variant="secondary">
          {dict.import.exportTasks}
        </ButtonLink>
        <ButtonLink href={`/api/export/maintenance?property=${id}`} variant="secondary">
          {dict.import.exportMaintenance}
        </ButtonLink>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ImportCsvForm
          label={dict.import.roomsTitle}
          help={dict.import.roomsHelp}
          columns={dict.import.roomsColumns}
          importAction={handleImportRooms}
        />
        <ImportCsvForm
          label={dict.import.materialsTitle}
          help={dict.import.materialsHelp}
          columns={dict.import.materialsColumns}
          importAction={handleImportMaterials}
        />
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
        <ImportCsvForm
          label={dict.import.maintenanceTitle}
          help={dict.import.maintenanceHelp}
          columns={dict.import.maintenanceColumns}
          importAction={handleImportMaintenance}
        />
      </div>
    </PageContainer>
  );
}
