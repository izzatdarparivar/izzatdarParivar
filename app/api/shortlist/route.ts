import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";


export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, profileId, notes, action } = body;


  if (!userId || !profileId) return NextResponse.json({ error: "userId and profileId required" }, { status: 400 });
  if (userId === profileId) return NextResponse.json({ error: "Cannot shortlist yourself" }, { status: 400 });


  const adminDb = getAdminDb();


  if (action === "remove") {
    await adminDb.collection("shortlists").doc(userId).collection("profiles").doc(profileId).delete();
    return NextResponse.json({ success: true });
  }


  await adminDb.collection("shortlists").doc(userId).collection("profiles").doc(profileId).set({
    profileId, addedAt: new Date(), ...(notes ? { notes } : {}),
  });
  return NextResponse.json({ success: true });
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });


  const adminDb = getAdminDb();
  const snap = await adminDb.collection("shortlists").doc(uid).collection("profiles").orderBy("addedAt", "desc").get();
  const profiles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ shortlist: profiles });
}

