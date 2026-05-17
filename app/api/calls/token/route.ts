import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const uid = await requireAuth(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      {
        urls: process.env.NEXT_PUBLIC_TURN_URL || "turn:openrelay.metered.ca:80",
        username: process.env.NEXT_PUBLIC_TURN_USERNAME || "openrelayproject",
        credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "openrelayproject",
      },
      {
        urls: process.env.NEXT_PUBLIC_TURN_URL?.replace("turn:", "turns:") || "turns:openrelay.metered.ca:443",
        username: process.env.NEXT_PUBLIC_TURN_USERNAME || "openrelayproject",
        credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "openrelayproject",
      }
    ]
  });
}
