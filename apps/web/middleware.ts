import "./polyfill";
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

function getSlugFromHost(hostName: string, baseDomain: string): string | null {
  // Exclude Vercel preview system domains from being parsed as tenant subdomains
  const isVercelPreview = hostName.endsWith(".vercel.app") && !hostName.includes("utsav.techsonance.co.in");
  if (isVercelPreview) {
    return null;
  }

  // Treat localhost, baseDomain and techsonance production domains as base main domain
  const isBaseDomain =
    hostName === "utsav.techsonance.co.in" ||
    hostName === "www.utsav.techsonance.co.in" ||
    hostName === baseDomain ||
    hostName === "localhost" ||
    hostName === "127.0.0.1";

  if (isBaseDomain) {
    return null;
  }

  // 1. Check if it's a subdomain of the base domain or techsonance domain
  const domains = [baseDomain, "utsav.techsonance.co.in"];
  for (const domain of domains) {
    if (domain && hostName.endsWith("." + domain)) {
      const sub = hostName.slice(0, -(domain.length + 1));
      if (sub && sub !== "www" && sub !== "admin" && sub !== "app") {
        return sub;
      }
      return null;
    }
  }

  // 2. For custom domains, extract the slug from the domain name (excluding TLD)
  const parts = hostName.split(".");
  if (parts.length >= 2) {
    // If it starts with www, skip it (e.g. www.temple.com -> temple)
    if (parts[0] === "www" && parts.length > 2) {
      return parts[1];
    }
    return parts[0];
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";

  // Enforce HTTPS in production
  if (
    process.env.NODE_ENV === "production" &&
    req.headers.get("x-forwarded-proto") === "http"
  ) {
    return NextResponse.redirect(`https://${host}${url.pathname}${url.search}`);
  }

  // 1. Rate Limiting on API endpoints
  if (url.pathname.startsWith("/api/v1/")) {
    let allowed = true;
    if (url.pathname.startsWith("/api/v1/auth/login")) {
      // Login rate limiting: 5 attempts per 5 minutes (300 seconds)
      allowed = await checkRateLimit(ip, 5, 300);
    } else if (url.pathname.startsWith("/api/v1/auth/signup")) {
      // Signup rate limiting: 5 attempts per 10 minutes (600 seconds)
      allowed = await checkRateLimit(ip, 5, 600);
    } else if (url.pathname.startsWith("/api/v1/auth/forgot-password")) {
      // Forgot password rate limiting: 5 attempts per 10 minutes (600 seconds)
      allowed = await checkRateLimit(ip, 5, 600);
    } else if (url.pathname.startsWith("/api/v1/auth/verify-otp")) {
      // Verify OTP rate limiting: 5 attempts per 5 minutes (300 seconds)
      allowed = await checkRateLimit(ip, 5, 300);
    } else if (url.pathname.startsWith("/api/v1/auth/verify-email")) {
      // Verify email rate limiting: 5 attempts per 5 minutes (300 seconds)
      allowed = await checkRateLimit(ip, 5, 300);
    } else if (url.pathname.startsWith("/api/v1/auth/resend-verification")) {
      // Resend verification rate limiting: 5 attempts per 10 minutes (600 seconds)
      allowed = await checkRateLimit(ip, 5, 600);
    } else if (url.pathname.startsWith("/api/v1/public/")) {
      // Public endpoints scraping protection: 60 requests per minute (60 seconds)
      allowed = await checkRateLimit(ip, 60, 60);
    } else if (
      url.pathname.startsWith("/api/v1/ai/") ||
      url.pathname.startsWith("/api/v1/generate/")
    ) {
      // AI generation requests protection: 10 requests per minute (60 seconds)
      allowed = await checkRateLimit(ip, 10, 60);
    } else {
      // Global rate limiting: 1000 requests per minute (60 seconds)
      allowed = await checkRateLimit(ip, 1000, 60);
    }

    if (!allowed) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          ip,
          action: "rate_limit_exceeded",
          path: url.pathname,
        })
      );
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Wildcard Subdomain and Path-based Slug Rewriting
  const baseDomain = (process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000").split(":")[0].toLowerCase();
  const hostName = host.split(":")[0].toLowerCase();

  // Extract slug/subdomain from hostname (handles subdomains and custom domains matching slug)
  const subdomain = getSlugFromHost(hostName, baseDomain);
  const isVercelPreview = hostName.endsWith(".vercel.app") && !hostName.includes("utsav.techsonance.co.in");

  const path = url.pathname;
  console.log(`[Middleware Debug] Host: ${hostName}, Path: ${path}, BaseDomain: ${baseDomain}, Subdomain: ${subdomain}, isVercelPreview: ${isVercelPreview}`);
  const isInternalOrApi =
    path.startsWith("/api") ||
    path.startsWith("/_") ||
    path.startsWith("/static") ||
    path.includes(".");

  if (!isInternalOrApi) {
    const reservedRoots = new Set([
      "auth",
      "onboarding",
      "join",
      "dashboard",
      "members",
      "events",
      "news",
      "donations",
      "expenses",
      "chat",
      "vendors",
      "gallery",
      "settings",
      "login",
      "register",
      "public",
      "forgot-password",
      "verify-email",
      "privacy-policy",
      "terms-of-service",
      "donate",
      "help-center",
      "admin",
      "assets",
    ]);

    const pathParts = path.split("/").filter(Boolean);
    const firstSegment = pathParts[0];

    // Priority 1: Subdomain-based routing (Production)
    if (subdomain) {
      const globalReservedRoots = new Set([
        "auth",
        "onboarding",
        "join",
        "login",
        "register",
        "forgot-password",
        "verify-email",
        "privacy-policy",
        "terms-of-service",
        "help-center",
        "admin",
        "api",
        "assets",
      ]);

      if (firstSegment && globalReservedRoots.has(firstSegment)) {
        // Do not rewrite global reserved roots (login, register, etc.) on subdomain
        const res = NextResponse.next();
        addSecurityHeaders(res);
        return res;
      }

      // If the path already starts with the subdomain (e.g. /temple/about), strip it to avoid double prefixing
      let cleanPath = path;
      const subdomainPrefix = `/${subdomain}`;
      if (path.toLowerCase().startsWith(subdomainPrefix + "/") || path.toLowerCase() === subdomainPrefix) {
        cleanPath = path.slice(subdomainPrefix.length);
        if (!cleanPath.startsWith("/")) {
          cleanPath = "/" + cleanPath;
        }
      }

      url.pathname = `/public/${subdomain}${cleanPath}`;
      const res = NextResponse.rewrite(url);
      addSecurityHeaders(res);
      return res;
    }

    // Priority 2: Path-based routing (Local development fallback)
    if (firstSegment && !reservedRoots.has(firstSegment)) {
      const restOfPath = path.slice(firstSegment.length + 1);
      url.pathname = `/public/${firstSegment}${restOfPath}`;
      const res = NextResponse.rewrite(url);
      addSecurityHeaders(res);
      return res;
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
    "default-src 'self' https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:;"
  );
}

export const config = {
  matcher: [
    // Match all paths except static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
