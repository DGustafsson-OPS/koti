import { SignJWT, importPKCS8 } from "jose";

export async function getAppleClientSecret() {
  const appleId = process.env.AUTH_APPLE_ID;
  const teamId = process.env.AUTH_APPLE_TEAM_ID;
  const keyId = process.env.AUTH_APPLE_KEY_ID;
  const privateKeyPem = process.env.AUTH_APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!appleId || !teamId || !keyId || !privateKeyPem) {
    throw new Error("Apple Sign In env vars are incomplete");
  }

  const privateKey = await importPKCS8(privateKeyPem, "ES256");

  return new SignJWT({})
    .setAudience("https://appleid.apple.com")
    .setIssuer(teamId)
    .setSubject(appleId)
    .setIssuedAt()
    .setExpirationTime("180d")
    .sign(privateKey);
}
