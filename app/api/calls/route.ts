import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { z } from "zod";

const GetCallSchema = z.object({
  callId: z.string().min(1, "callId is required"),
});

// GET /api/calls?callId=xxx — fetch call status
export async function GET(req: NextRequest) {
  try {
    const uid = await requireAuth(req);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const parseResult = GetCallSchema.safeParse(Object.fromEntries(searchParams));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parseResult.error.issues }, { status: 400 });
    }

    const callId = parseResult.data.callId;
    const snap = await getAdminDb().collection("calls").doc(callId).get();
    
    if (!snap.exists) return NextResponse.json({ error: "Call not found" }, { status: 404 });

    const data = snap.data()!;
    if (data.callerId !== uid && data.receiverId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ call: { id: snap.id, ...data } });
  } catch (error: any) {
    console.error("Error in GET /api/calls:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
