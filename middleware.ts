import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  
  if (request.nextUrl.pathname.startsWith("/api/matches") || request.nextUrl.pathname.startsWith("/api/recommendations")) {
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Note: Edge token verification logic will go in lib/auth-edge.ts
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
