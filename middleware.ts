import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if ENV vars are set, otherwise fallback to empty for build time
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? Redis.fromEnv() : null;

// 10 requests per 10 seconds per IP
const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
}) : null;

export async function middleware(request: NextRequest) {
  if (ratelimit) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
  }

  const sessionCookie = request.cookies.get("__session")?.value;
  const path = request.nextUrl.pathname;

  // Protect API routes
  if (path.startsWith("/api/matches") || path.startsWith("/api/recommendations")) {
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect Page routes
  const protectedPages = ["/dashboard", "/matches", "/profile/create", "/settings", "/notifications"];
  const isProtectedPage = protectedPages.some(p => path.startsWith(p));

  if (isProtectedPage && !sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const response = NextResponse.next();

  // Explicit CORS configuration
  const allowedOrigins = ['https://izzatdarparivar.com', 'https://www.izzatdarparivar.com', 'http://localhost:3000'];
  const origin = request.headers.get("origin") || "";
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    response.headers.set("Access-Control-Allow-Origin", "https://izzatdarparivar.com");
  }
  
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-razorpay-signature");

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/matches/:path*",
    "/profile/create/:path*",
    "/settings/:path*",
    "/notifications/:path*"
  ],
};
