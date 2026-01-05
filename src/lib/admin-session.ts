const encoder = new TextEncoder();

export const ADMIN_COOKIE_NAME = "darunow_admin_session";
export const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

const base64UrlEncode = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const signMessage = async (message: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return base64UrlEncode(new Uint8Array(signature));
};

export const createAdminSessionToken = async ({
  username,
  secret,
  ttlMs = ADMIN_SESSION_TTL_MS,
}: {
  username: string;
  secret: string;
  ttlMs?: number;
}) => {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${username}.${expiresAt}`;
  const signature = await signMessage(payload, secret);
  return `${payload}.${signature}`;
};

export const verifyAdminSessionToken = async ({
  token,
  secret,
  expectedUser,
}: {
  token: string;
  secret: string;
  expectedUser?: string;
}) => {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [username, expiresAt, signature] = parts;
  if (!username || !expiresAt || !signature) return false;
  if (expectedUser && username !== expectedUser) return false;
  const exp = Number(expiresAt);
  if (!exp || Number.isNaN(exp) || Date.now() > exp) return false;
  const expectedSignature = await signMessage(`${username}.${expiresAt}`, secret);
  return signature === expectedSignature;
};
