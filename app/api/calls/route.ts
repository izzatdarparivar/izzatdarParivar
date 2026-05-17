import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getAdminDb } from "@/lib/firebase-admin";

// GET /api/calls?callId=xxx — fetch call status
export async function GET(req: NextRequest) {
  const uid = await requireAuth(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callId = req.nextUrl.searchParams.get("callId");
  if (!callId) return NextResponse.json({ error: "callId required" }, { status: 400 });

  const snap = await getAdminDb().collection("calls").doc(callId).get();
  if (!snap.exists) return NextResponse.json({ error: "Call not found" }, { status: 404 });

  const data = snap.data()!;
  if (data.callerId !== uid && data.receiverId !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ call: { id: snap.id, ...data } });
}
