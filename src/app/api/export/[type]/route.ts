import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { exportAssetsCsv, exportTasksCsv } from "@/lib/export-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { type } = await params;
  const propertyId = request.nextUrl.searchParams.get("property");
  if (!propertyId) {
    return new Response("Missing property", { status: 400 });
  }

  let csv: string;
  let filename: string;

  if (type === "assets") {
    csv = await exportAssetsCsv(propertyId);
    filename = "koti-assets.csv";
  } else if (type === "tasks") {
    csv = await exportTasksCsv(propertyId);
    filename = "koti-tasks.csv";
  } else {
    return new Response("Not found", { status: 404 });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
