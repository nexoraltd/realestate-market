import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deprecated: Google OAuth is now handled by Clerk via the /login page.
 */
export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
  return NextResponse.redirect(`${baseUrl}/login`);
}
