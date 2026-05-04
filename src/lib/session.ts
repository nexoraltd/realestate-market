import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";
const COOKIE_NAME = "re_session";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface SessionData {
  email: string;
  plan: string;
}

interface SignedPayload extends SessionData {
  exp: number;
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function encodeSession(data: SessionData): string {
  const raw = JSON.stringify({ ...data, exp: Date.now() + TTL_MS });
  const payload = Buffer.from(raw).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string): SessionData | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (sign(payload) !== sig) return null;
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as SignedPayload;
    if (data.exp < Date.now()) return null;
    return { email: data.email, plan: data.plan };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: TTL_MS / 1000,
    path: "/",
  },
};
