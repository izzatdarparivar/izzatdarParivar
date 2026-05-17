import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const callerUid = await requireAuth(req);
  if (!callerUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, receiverName, type } = await req.json();
  if (!receiverId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = getAdminDb();

  // Check for active chat session
  const chatSnap = await db.collection("chat_sessions")
    .where("participants", "array-contains", callerUid)
    .get();

  const hasActiveChat = chatSnap.docs.some(d => {
    const data = d.data();
    return data.participants.includes(receiverId) && data.status === "accepted";
  });

  if (!hasActiveChat) {
    // Check mutual interest
    const sentInterest1 = await db.collection("interests")
      .where("fromUserId", "==", callerUid)
      .where("toUserId", "==", receiverId)
      .where("status", "==", "accepted")
      .get();

    const sentInterest2 = await db.collection("interests")
      .where("fromUserId", "==", receiverId)
      .where("toUserId", "==", callerUid)
      .where("status", "==", "accepted")
      .get();

    if (sentInterest1.empty && sentInterest2.empty) {
      return NextResponse.json(
        { error: "You need an accepted connection or active chat to call this person." },
        { status: 403 }
      );
    }
  }

  // Permission granted — create the call document
  const callRef = await db.collection("calls").add({
    callerId: callerUid,
    callerName: "Caller", // Fetch from profile if needed
    receiverId,
    receiverName,
    type,
    status: "ringing",
    createdAt: new Date(),
  });

  return NextResponse.json({ callId: callRef.id });
}
