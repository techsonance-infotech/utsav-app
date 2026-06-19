import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function checkRateLimit(ip: string, limit: number, windowSeconds: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // Fallback when Upstash Redis is not configured (local/dev/CI)
    return true;
  }
  try {
    const key = `ratelimit:${ip}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds],
      ]),
    });
    if (!res.ok) return true; // Fail-open
    const data = await res.json();
    const count = data[0]?.result;
    return count <= limit;
  } catch (err) {
    console.error("Rate limiting error:", err);
    return true; // Fail-open
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";

  // 1. Rate Limiting on API endpoints
  if (url.pathname.startsWith("/api/v1/")) {
    let allowed = true;
    if (url.pathname.startsWith("/api/v1/auth/otp/send")) {
      // OTP rate limiting: 5 attempts per 10 minutes (600 seconds)
      allowed = await checkRateLimit(ip, 5, 600);
    } else {
      // Global rate limiting: 1000 requests per minute (60 seconds)
      allowed = await checkRateLimit(ip, 1000, 60);
    }

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Wildcard Subdomain Rewriting
  if (
    !url.pathname.startsWith("/api") &&
    !url.pathname.startsWith("/_next") &&
    !url.pathname.startsWith("/static") &&
    !url.pathname.startsWith("/auth") &&
    !url.pathname.startsWith("/onboarding") &&
    !url.pathname.startsWith("/join") &&
    !url.pathname.startsWith("/dashboard") &&
    !url.pathname.includes(".")
  ) {
    const parts = host.split(".");
    if (parts.length > 2) {
      const subdomain = parts[0];
      if (subdomain !== "www" && subdomain !== "admin" && subdomain !== "app") {
        url.pathname = `/public/${subdomain}${url.pathname}`;
        const res = NextResponse.rewrite(url);
        addSecurityHeaders(res);
        return res;
      }
    }
  }

  const res = NextResponse.next();
  addSecurityHeaders(res);
  return res;
}

function addSecurityHeaders(res: NextResponse) {
  // Apply standard production-ready security headers
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self' https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;"
  );
}

export const config = {
  matcher: [
    // Match all paths except static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
