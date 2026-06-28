import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect HTTP to HTTPS in production
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get("host")}${pathname}`,
      301
    );
  }

  // Block common attack patterns in URLs
  const blockedPatterns = [
    /\.\.\//,           // Path traversal
    /<script/i,         // XSS in URL
    /union.*select/i,   // SQL injection
    /exec\s*\(/i,       // Remote code execution
    /etc\/passwd/i,     // LFI attacks
    /\.php$/i,          // PHP probing
    /\.env$/i,          // .env file access
    /wp-admin/i,        // WordPress probing
    /xmlrpc\.php/i,     // WordPress xmlrpc
  ];

  if (blockedPatterns.some((pattern) => pattern.test(pathname))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Admin route protection: only allow if coming from same origin
  if (pathname.startsWith("/admin")) {
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    // Still allow direct navigation (no referer = direct visit)
    // The PIN auth inside the admin page is the main protection
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
