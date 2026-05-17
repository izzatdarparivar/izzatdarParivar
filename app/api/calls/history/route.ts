import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { z } from "zod";

const CallHistoryParamsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const callerUid = await requireAuth(req);
    if (!callerUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const parseResult = CallHistoryParamsSchema.safeParse(Object.fromEntries(searchParams));
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid search parameters", details: parseResult.error.issues }, { status: 400 });
    }

    const limitCount = parseResult.data.limit;
    const db = getAdminDb();

    // Query calls where callerId == callerUid OR receiverId == callerUid
    // Using parallel queries to avoid requiring complex composite OR indexes
    const [callerSnap, receiverSnap] = await Promise.all([
      db.collection("calls").where("callerId", "==", callerUid).orderBy("createdAt", "desc").limit(limitCount).get(),
      db.collection("calls").where("receiverId", "==", callerUid).orderBy("createdAt", "desc").limit(limitCount).get(),
    ]);

    const callsMap = new Map<string, any>();
    callerSnap.docs.forEach(doc => {
      callsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    receiverSnap.docs.forEach(doc => {
      callsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const allCalls = Array.from(callsMap.values());
    allCalls.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    const paginatedCalls = allCalls.slice(0, limitCount);

    return NextResponse.json({ calls: paginatedCalls });
  } catch (error: any) {
    console.error("Error fetching call history:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
