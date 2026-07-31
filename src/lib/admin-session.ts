import type { Permission, Role, User } from "@/data/models";

export const ADMIN_SESSION_COOKIE = "paintflow-admin-session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "paintflow-dev-session-secret";

export interface AdminSessionUser {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

export interface AdminSession extends AdminSessionUser {
  expiresAt: number;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signText(value: string) {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(ADMIN_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toHex(signature);
}

function serializeSession(session: AdminSession) {
  return encodeURIComponent(JSON.stringify(session));
}

function deserializeSession(serialized: string) {
  return JSON.parse(decodeURIComponent(serialized)) as AdminSession;
}

export function createAdminSessionFromUser(user: User, expiresAt: number): AdminSession {
  return {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    expiresAt,
  };
}

export async function createAdminSessionToken(session: AdminSession) {
  const serialized = serializeSession(session);
  const signature = await signText(serialized);
  return `${serialized}|${signature}`;
}

export async function verifyAdminSessionToken(token: string) {
  const separatorIndex = token.lastIndexOf("|");

  if (separatorIndex <= 0) {
    return null;
  }

  const serialized = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = await signText(serialized);

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const session = deserializeSession(serialized);

    if (!session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
