import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deprecated: Google OAuth callback is now handled by Clerk's /sso-callback page.
 */
export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
  return NextResponse.redirect(`${baseUrl}/login`);
}
