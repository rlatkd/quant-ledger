export interface SessionPayload {
  userId: string;
  role: string;
  expiresAt: number;
}

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-secret-change-me";
}

async function importKey(usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage,
  );
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const encoded = btoa(JSON.stringify(payload));
  const key = await importKey(["sign"]);
  const buf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded));
  const sig = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${encoded}.${sig}`;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const key = await importKey(["verify"]);
    const sigBytes = new Uint8Array(
      (sig.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)),
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(encoded),
    );
    if (!valid) return null;
    return JSON.parse(atob(encoded)) as SessionPayload;
  } catch {
    return null;
  }
}
