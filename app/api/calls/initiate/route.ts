import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { z } from "zod";

const InitiateCallSchema = z.object({
  receiverId: z.string().min(1, "receiverId is required"),
  receiverName: z.string().min(1, "receiverName is required"),
  type: z.enum(["video", "voice"]),
});

export async function POST(req: NextRequest) {
  try {
    const callerUid = await requireAuth(req);
    if (!callerUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parseResult = InitiateCallSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid input", details: parseResult.error.issues }, { status: 400 });
    }

    const { receiverId, receiverName, type } = parseResult.data;
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

    // Permission granted — fetch caller profile for name
    const callerDoc = await db.collection("users").doc(callerUid).get();
    const callerName = callerDoc.exists ? (callerDoc.data()?.name || "Someone") : "Someone";
    const callerPhoto = callerDoc.exists ? (callerDoc.data()?.photoURL || "") : "";

    // Create the call document
    const callRef = await db.collection("calls").add({
      callerId: callerUid,
      callerName,
      receiverId,
      receiverName,
      type,
      status: "ringing",
      createdAt: new Date(),
    });

    // Create a notification for the receiver so they see the call even if not on the chat page
    await db.collection("notifications").add({
      userId: receiverId,
      type: "system",
      title: `Incoming ${type === "video" ? "Video" : "Voice"} Call 📞`,
      body: `${callerName} is calling you`,
      read: false,
      actionUrl: `/chat`,
      fromUserId: callerUid,
      fromUserName: callerName,
      fromUserPhoto: callerPhoto,
      createdAt: new Date(),
    });

    return NextResponse.json({ callId: callRef.id });
  } catch (error: any) {
    console.error("Error in POST /api/calls/initiate:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
