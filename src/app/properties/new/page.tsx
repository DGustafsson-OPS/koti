import { redirect } from "next/navigation";
import { createProperty } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Select, Textarea, Button, Panel } from "@/components/ui";
import { getDictionary, propertyTypeLabel } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

async function handleCreate(formData: FormData) {
  "use server";
  const id = await createProperty({
    name: formData.get("name") as string,
    address: (formData.get("address") as string) || undefined,
    propertyType: (formData.get("propertyType") as string) || undefined,
    yearBuilt: formData.get("yearBuilt") ? Number(formData.get("yearBuilt")) : undefined,
    sizeSqm: formData.get("sizeSqm") ? Number(formData.get("sizeSqm")) : undefined,
    notes: (formData.get("notes") as string) || undefined,
  });
  redirect(`/properties/${id}`);
}

const PROPERTY_TYPE_KEYS = ["house", "apartment", "townhouse", "duplex", "other"] as const;

export default async function NewPropertyPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.propertyNew.title}
        subtitle={dict.propertyNew.subtitle}
        back={{ href: "/properties", label: dict.common.allProperties }}
      />
      <Panel>
        <form action={handleCreate} className="space-y-4">
          <Input
            label={dict.propertyNew.name}
            name="name"
            required
            placeholder={dict.propertyNew.namePlaceholder}
          />
          <Input
            label={dict.propertyNew.address}
            name="address"
            placeholder={dict.propertyNew.addressPlaceholder}
          />
          <Select label={dict.propertyNew.type} name="propertyType" defaultValue="house">
            {PROPERTY_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {propertyTypeLabel(dict, key)}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={dict.propertyNew.yearBuilt}
              name="yearBuilt"
              type="number"
              placeholder={dict.propertyNew.yearPlaceholder}
            />
            <Input
              label={dict.propertyNew.size}
              name="sizeSqm"
              type="number"
              placeholder={dict.propertyNew.sizePlaceholder}
            />
          </div>
          <Textarea
            label={dict.propertyNew.notes}
            name="notes"
            placeholder={dict.propertyNew.notesPlaceholder}
          />
          <Button type="submit">{dict.propertyNew.submit}</Button>
        </form>
      </Panel>
    </PageContainer>
  );
}
