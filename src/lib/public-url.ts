import type { NextRequest } from "next/server";

/** Build redirect URLs using the public host behind nginx, not 127.0.0.1:8088. */
export function publicUrl(request: NextRequest, pathname: string): URL {
  const configured = process.env.APP_URL;
  if (configured) {
    return new URL(pathname, configured);
  }

  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host")?.split(",")[0]?.trim();

  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";

  if (host && !host.startsWith("127.0.0.1") && !host.startsWith("localhost")) {
    return new URL(pathname, `${proto}://${host}`);
  }

  return new URL(pathname, request.url);
}
