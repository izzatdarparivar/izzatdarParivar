import { NextRequest, NextResponse } from "next/server";


// In-memory rate limit store (resets on cold start — see DEV-02 for Redis upgrade)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();


const RATE_LIMITS = {
  api: { windowMs: 60_000, max: 60 },
  auth: { windowMs: 300_000, max: 10 },
  upload: { windowMs: 60_000, max: 5 },
};


function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}


function getRateLimitConfig(pathname: string) {
  if (
    pathname.startsWith("/api/auth") ||
    pathname.includes("login") ||
    pathname.includes("signup")
  ) {
    return RATE_LIMITS.auth;
  }
  if (pathname.includes("upload") || pathname.includes("cloudinary")) {
    return RATE_LIMITS.upload;
  }
  return RATE_LIMITS.api;
}


function checkRateLimit(
  key: string,
  config: { windowMs: number; max: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs };
  }

  entry.count += 1;
  if (entry.count > config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}


export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(req);
    const config = getRateLimitConfig(pathname);
    const key = `${pathname.split("/").slice(0, 3).join("/")}:${ip}`;
    const { allowed, remaining, resetAt } = checkRateLimit(key, config);

    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(resetAt));

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Handle admin path — cryptographically verify the JWT via Firebase Admin
  if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/dashboard/admin")) {
    if (req.nextUrl.pathname.startsWith("/dashboard/admin")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    const sessionCookie = req.cookies.get("__session")?.value;
    const authHeader = req.headers.get("authorization");
    const token = sessionCookie || authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?redirect=/admin", req.url));
    }

    // SEC-02: Verify JWT cryptographically via Firebase Admin SDK
    // Note: firebase-admin cannot run in Edge Runtime, so we call a
    // lightweight server-side verification endpoint instead.
    try {
      const verifyUrl = new URL("/api/auth/verify-admin", req.url);
      const verifyRes = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!verifyRes.ok) {
        return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
      }

      const { role } = await verifyRes.json();
      if (role !== "admin" && role !== "moderator") {
        return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/login?error=invalid_token", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
