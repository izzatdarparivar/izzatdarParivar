import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/api-auth";


export async function POST(request: NextRequest) {
  const callerUid = await requireAuth(request);
  if (!callerUid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { profileId, notes, action } = body;
  const userId = callerUid; // Always use verified UID


  if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 });
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
  const callerUid = await requireAuth(request);
  if (!callerUid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid") || callerUid;
  if (uid !== callerUid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });


  const adminDb = getAdminDb();
  const snap = await adminDb.collection("shortlists").doc(uid).collection("profiles").orderBy("addedAt", "desc").get();
  const profiles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ shortlist: profiles });
}

