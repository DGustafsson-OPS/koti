import { redirect } from "next/navigation";
import { createProperty } from "@/lib/queries";
import { PageHeader, Input, Select, Textarea, Button } from "@/components/ui";

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

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <PageHeader title="Add property" subtitle="Create a new home record" />
      <form action={handleCreate} className="space-y-4 bg-white border border-stone-200 rounded-xl p-6">
        <Input label="Name *" name="name" required placeholder="Main Home" />
        <Input label="Address" name="address" placeholder="12 Birch Lane, Helsinki" />
        <Select label="Property type" name="propertyType" defaultValue="house">
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="townhouse">Townhouse</option>
          <option value="duplex">Duplex</option>
          <option value="other">Other</option>
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Year built" name="yearBuilt" type="number" placeholder="1985" />
          <Input label="Size (m²)" name="sizeSqm" type="number" placeholder="145" />
        </div>
        <Textarea label="Notes" name="notes" placeholder="Shutoff locations, panel info..." />
        <Button type="submit">Create property</Button>
      </form>
    </div>
  );
}
