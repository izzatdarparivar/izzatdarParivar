import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";


export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fromUserId, toUserId, action, interestId } = body;


  if (!fromUserId || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }


  const adminDb = getAdminDb();


  if (action === "send") {
    if (!toUserId) return NextResponse.json({ error: "toUserId required" }, { status: 400 });
    if (fromUserId === toUserId) return NextResponse.json({ error: "Cannot send interest to yourself" }, { status: 400 });


    const existingSnap = await adminDb.collection("interests").where("fromUserId", "==", fromUserId).where("toUserId", "==", toUserId).where("status", "==", "pending").get();
    if (!existingSnap.empty) return NextResponse.json({ error: "Interest already sent" }, { status: 409 });


    const reverseSnap = await adminDb.collection("interests").where("fromUserId", "==", toUserId).where("toUserId", "==", fromUserId).where("status", "==", "pending").get();
    if (!reverseSnap.empty) {
      const reverseDoc = reverseSnap.docs[0];
      await reverseDoc.ref.update({ status: "accepted" });
      await adminDb.collection("interests").add({ fromUserId, toUserId, status: "accepted", createdAt: new Date(), expiresAt: null });
      return NextResponse.json({ success: true, isMutual: true });
    }


    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await adminDb.collection("interests").add({ fromUserId, toUserId, status: "pending", createdAt: new Date(), expiresAt });
    return NextResponse.json({ success: true, isMutual: false });
  }


  if (action === "accept" || action === "decline") {
    if (!interestId) return NextResponse.json({ error: "interestId required" }, { status: 400 });
    await adminDb.collection("interests").doc(interestId).update({ status: action === "accept" ? "accepted" : "declined" });
    return NextResponse.json({ success: true });
  }


  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const type = searchParams.get("type") || "received";
  const status = searchParams.get("status");


  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });


  const adminDb = getAdminDb();
  const field = type === "sent" ? "fromUserId" : "toUserId";


  let q = adminDb.collection("interests").where(field, "==", uid).orderBy("createdAt", "desc").limit(50);
  if (status) {
    q = adminDb.collection("interests").where(field, "==", uid).where("status", "==", status).orderBy("createdAt", "desc").limit(50);
  }


  const snap = await q.get();
  const interests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ interests });
}



