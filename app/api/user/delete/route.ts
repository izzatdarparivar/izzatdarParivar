import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getAdminDb, adminAuth } from "@/lib/firebase-admin";

export async function DELETE(req: NextRequest) {
  try {
    const uid = await requireAuth(req);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getAdminDb();
    const batch = db.batch();

    // 1. Delete user profile
    const userRef = db.collection("users").doc(uid);
    batch.delete(userRef);

    // 2. Delete blocks subcollection
    const blocksSnap = await db.collection("blocks").doc(uid).collection("blockedUsers").get();
    blocksSnap.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(db.collection("blocks").doc(uid));

    // 3. Delete user interactions
    const interactionsSnap = await db.collection("user_interactions").where("userId", "==", uid).get();
    interactionsSnap.docs.forEach(doc => batch.delete(doc.ref));

    // 4. Delete push subscriptions
    const pushRef = db.collection("push_subscriptions").doc(uid);
    batch.delete(pushRef);

    // 5. Commit batch
    await batch.commit();

    // 6. Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true, message: "User data cascade deleted successfully" });
  } catch (error: any) {
    console.error("Cascade delete error:", error);
    return NextResponse.json({ error: "Failed to delete user data", details: error.message }, { status: 500 });
  }
}
