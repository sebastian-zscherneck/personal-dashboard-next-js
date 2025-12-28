import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-oauth";

/**
 * GET /api/setup/google-auth
 * Redirects to Google OAuth consent screen for one-time setup.
 * After authorization, user will be redirected to /api/setup/google-auth/callback
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/setup/google-auth/callback`;

    const authUrl = getAuthUrl(redirectUri);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." },
      { status: 500 }
    );
  }
}
