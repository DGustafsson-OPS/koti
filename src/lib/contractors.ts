export function parseContractorForm(formData: FormData) {
  return {
    contractorId: (formData.get("contractorId") as string) || undefined,
    contractor: (formData.get("contractor") as string) || undefined,
  };
}

export function displayContractorName(
  event: { contractor?: string | null; contractorId?: string | null },
  contractorsById: Map<string, string>
) {
  if (event.contractorId) {
    return contractorsById.get(event.contractorId) ?? event.contractor ?? "";
  }
  return event.contractor ?? "";
}
