import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/api-auth";


export async function POST(request: NextRequest) {
  try {
    const callerUid = await requireAuth(request);
    if (!callerUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { blockedId, action } = body as {
      blockedId: string;
      action?: "block" | "unblock";
    };
    const blockerId = callerUid; // Always use verified UID

    if (!blockedId) {
      return NextResponse.json(
        { error: "blockedId is required" },
        { status: 400 }
      );
    }
    if (blockerId === blockedId) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const blockRef = adminDb
      .collection("blocks")
      .doc(blockerId)
      .collection("blockedUsers")
      .doc(blockedId);

    if (action === "unblock") {
      await blockRef.delete();
      return NextResponse.json({ success: true, action: "unblocked" });
    }

    await blockRef.set({ blockedUserId: blockedId, blockedAt: new Date() });
    return NextResponse.json({ success: true, action: "blocked" });
  } catch (error: any) {
    console.error("Error in POST /api/block:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
  const callerUid = await requireAuth(request);
  if (!callerUid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid") || callerUid;

  if (uid !== callerUid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const adminDb = getAdminDb();
    const snap = await adminDb
      .collection("blocks")
      .doc(uid)
      .collection("blockedUsers")
      .get();

    const blocked = snap.docs.map((d) => d.data().blockedUserId as string);
    return NextResponse.json({ blocked });
  } catch (error: any) {
    console.error("Error in GET /api/block:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
