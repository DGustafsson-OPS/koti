import { readFile } from "fs/promises";
import { getAttachment } from "@/lib/queries";
import { storedFilePath } from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attachment = await getAttachment(id);
  if (!attachment) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const buffer = await readFile(storedFilePath(attachment.storedName));
    return new Response(buffer, {
      headers: {
        "Content-Type": attachment.mimeType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${attachment.filename.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
