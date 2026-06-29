import { createHash } from "crypto";
import { CompactEncrypt, compactDecrypt } from "jose";

function getEncryptionKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return createHash("sha256").update(`koti-secrets:${secret}`).digest();
}

export async function encryptSecret(plaintext: string): Promise<string> {
  return new CompactEncrypt(new TextEncoder().encode(plaintext))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(getEncryptionKey());
}

export async function decryptSecret(ciphertext: string): Promise<string> {
  const { plaintext } = await compactDecrypt(ciphertext, getEncryptionKey());
  return new TextDecoder().decode(plaintext);
}
