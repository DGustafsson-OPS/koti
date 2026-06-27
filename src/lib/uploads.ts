import path from "path";
import fs from "fs/promises";

export function getUploadDir() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
}

export async function ensureUploadDir() {
  await fs.mkdir(getUploadDir(), { recursive: true });
}

export function storedFilePath(storedName: string) {
  return path.join(getUploadDir(), storedName);
}
