"use server";

import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { createAttachment, deleteAttachmentRecord } from "@/lib/queries";
import { ensureUploadDir, storedFilePath } from "@/lib/uploads";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadAttachment(formData: FormData) {
  const file = formData.get("file");
  const propertyId = String(formData.get("propertyId") ?? "");
  const entityType = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "");

  if (!(file instanceof File) || !propertyId || !entityType || !entityId) {
    throw new Error("Invalid upload");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 10 MB)");
  }

  await ensureUploadDir();
  const ext = path.extname(file.name).slice(0, 16);
  const storedName = `${uuid()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(storedFilePath(storedName), buffer);

  await createAttachment({
    propertyId,
    entityType,
    entityId,
    filename: file.name,
    storedName,
    mimeType: file.type || undefined,
    sizeBytes: file.size,
  });
}

export async function removeAttachment(id: string) {
  const attachment = await deleteAttachmentRecord(id);
  await unlink(storedFilePath(attachment.storedName)).catch(() => {});
}
