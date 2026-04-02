import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

const SECRET = process.env.INTERNAL_API_SECRET!;
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN || "";
const PROJECT_ID = "prj_bHeOyLI48vtaaT6mzMyawRzISinp";
const TEAM_ID = "team_eroJgXk42DNblb4sib8ik6nA";
const ENV_ID = "2OHZYQucqPjZHB58"; // NEWSLETTER_SUBSCRIBERS env var ID

function verifyToken(email: string, token: string): boolean {
  const expected = createHmac("sha256", SECRET)
    .update(`newsletter-unsubscribe:${email}`)
    .digest("hex");
  return token === expected;
}

function resultPage(title: string, message: string, ok: boolean): string {
  const color = ok ? "#16a34a" : "#dc2626";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f8fafc}
    .card{background:#fff;border-radius:16px;padding:48px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:400px}
    h1{color:${color};font-size:24px;margin:0 0 12px}p{color:#64748b;font-size:16px;margin:0}</style>
    </head><body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
}

async function updateSubscribers(newList: string[]): Promise<boolean> {
  if (!VERCEL_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${PROJECT_ID}/env/${ENV_ID}?teamId=${TEAM_ID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: newList.join(",") }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token || !verifyToken(email, token)) {
    return new NextResponse(
      resultPage("エラー", "無効なリンクです。", false),
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Remove from subscriber list
  const current = (process.env.NEWSLETTER_SUBSCRIBERS || "")
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));

  const updated = current.filter(
    (e) => e.toLowerCase() !== email.toLowerCase()
  );

  if (updated.length < current.length) {
    await updateSubscribers(updated);
  }

  return new NextResponse(
    resultPage(
      "配信を停止しました",
      `${email} への週刊レポートの配信を停止しました。`,
      true
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
