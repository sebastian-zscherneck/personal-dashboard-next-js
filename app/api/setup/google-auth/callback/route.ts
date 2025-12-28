import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google-oauth";

/**
 * GET /api/setup/google-auth/callback
 * Receives the authorization code from Google and displays the refresh token.
 * User should copy this token to GOOGLE_REFRESH_TOKEN in .env.local
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Authorization Failed</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f0f0f; color: white; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #ff4444; }
            .error { background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #ff4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Authorization Failed</h1>
            <div class="error">
              <p>Google returned an error: <strong>${error}</strong></p>
              <p>Please try again: <a href="/api/setup/google-auth" style="color: #E0FF00;">Retry</a></p>
            </div>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Missing Authorization Code</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f0f0f; color: white; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #ff4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Missing Authorization Code</h1>
            <p>No authorization code was received from Google.</p>
            <p><a href="/api/setup/google-auth" style="color: #E0FF00;">Try again</a></p>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const baseUrl = request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/setup/google-auth/callback`;

    const { refreshToken } = await getTokensFromCode(code, redirectUri);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Google OAuth Setup Complete</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f0f0f; color: white; padding: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #E0FF00; }
            .success { background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #E0FF00; margin: 20px 0; }
            .token {
              background: #0a0a0a;
              padding: 15px;
              border-radius: 4px;
              font-family: monospace;
              word-break: break-all;
              font-size: 12px;
              margin: 10px 0;
              border: 1px solid #333;
            }
            .steps { margin-top: 30px; }
            .steps li { margin: 10px 0; }
            code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; }
            .copy-btn {
              background: #E0FF00;
              color: black;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              margin-top: 10px;
            }
            .copy-btn:hover { background: #c8e000; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Google OAuth Setup Complete!</h1>

            <div class="success">
              <p><strong>Your refresh token:</strong></p>
              <div class="token" id="token">${refreshToken}</div>
              <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('token').textContent); this.textContent = 'Copied!';">
                Copy Token
              </button>
            </div>

            <div class="steps">
              <h2>Next Steps:</h2>
              <ol>
                <li>Copy the refresh token above</li>
                <li>Open <code>.env.local</code> in your project</li>
                <li>Add this line:
                  <div class="token">GOOGLE_REFRESH_TOKEN=${refreshToken}</div>
                </li>
                <li>Restart your dev server (<code>npm run dev</code>)</li>
                <li>Done! Invoice PDFs will now upload to your Google Drive automatically.</li>
              </ol>
            </div>

            <p style="margin-top: 40px; color: #666;">
              This page can be closed. You only need to do this setup once.
            </p>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Token Exchange Failed</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f0f0f; color: white; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #ff4444; }
            .error { background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #ff4444; }
            pre { background: #0a0a0a; padding: 10px; overflow-x: auto; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Token Exchange Failed</h1>
            <div class="error">
              <p>Failed to exchange authorization code for tokens.</p>
              <pre>${error instanceof Error ? error.message : "Unknown error"}</pre>
              <p><a href="/api/setup/google-auth" style="color: #E0FF00;">Try again</a></p>
            </div>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
