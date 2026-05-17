import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function DELETE(req: NextRequest) {
  const uid = await requireAuth(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = adminDb;
    const batch = db.batch();

    // 1. Delete user profile
    batch.delete(db.collection("users").doc(uid));

    // 2. Delete shortlists
    const shortlistSnap = await db.collection("shortlists").doc(uid)
      .collection("profiles").get();
    shortlistSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection("shortlists").doc(uid));

    // 3. Delete sent interests
    const sentInterests = await db.collection("interests")
      .where("fromUserId", "==", uid).get();
    sentInterests.docs.forEach(d => batch.delete(d.ref));

    // 4. Delete received interests
    const receivedInterests = await db.collection("interests")
      .where("toUserId", "==", uid).get();
    receivedInterests.docs.forEach(d => batch.delete(d.ref));

    // 5. Delete notifications
    const notifications = await db.collection("notifications")
      .where("userId", "==", uid).get();
    notifications.docs.forEach(d => batch.delete(d.ref));

    // 6. Delete blocks placed by this user
    const blocks = await db.collection("blocks").doc(uid)
      .collection("blockedUsers").get();
    blocks.docs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection("blocks").doc(uid));

    // 7. Delete trust score
    batch.delete(db.collection("trust_scores").doc(uid));

    // 8. Delete subscription record
    const subSnap = await db.collection("subscriptions")
      .where("userId", "==", uid).get();
    subSnap.docs.forEach(d => batch.delete(d.ref));

    await batch.commit();

    // 9. Delete Firebase Auth account (do this last)
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
