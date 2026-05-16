import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyAdmin } from "@/lib/firebase-admin";


export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });


  try {
    const snapshot = await adminDb
      .collection("users")
      .where("status", "==", "pending")
      .get();

    let profiles = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        photoURL: data.photoURL || data.photoUrl || null, // Handle both cases
        createdAtObj: data.createdAt?.toDate?.() || new Date(0),
        createdAt: data.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown",
      };
    });

    // Sort in memory
    profiles.sort((a, b) => b.createdAtObj.getTime() - a.createdAtObj.getTime());

    // Clean up before response
    profiles = profiles.map(p => {
      const { createdAtObj, ...rest } = p;
      return rest;
    });

    return NextResponse.json({ profiles });
  } catch (e: any) {
    console.error("Approvals GET error:", e.message);
    if (e.code === 9 || e.message.includes("index")) {
       console.error("FIREBASE INDEX REQUIRED:", e.message);
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });


  try {
    const { userId, action, reason } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }


    const userRef = adminDb.collection("users").doc(userId);
    const newStatus = action === "approve" ? "approved" : "rejected";


    await userRef.update({
      status: newStatus,
      [`${action}dAt`]: new Date(),
      [`${action}dBy`]: admin.uid,
      ...(reason && { rejectionReason: reason }),
    });


    await adminDb.collection("admin_logs").add({
      action: `profile_${action}d`,
      targetUser: userId,
      performedBy: admin.uid,
      reason: reason || null,
      timestamp: new Date(),
    });


    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}



