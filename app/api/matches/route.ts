import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { calculateCompatibility } from "@/lib/matching";
import { UserProfile } from "@/lib/firestore";
import { requireAuth } from "@/lib/api-auth";


export async function GET(request: NextRequest) {
  try {
    const callerUid = await requireAuth(request);
    if (!callerUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid") || callerUid;

    if (uid !== callerUid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cursor = searchParams.get("cursor");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 50);

    const adminDb = getAdminDb();
    const seekerDoc = await adminDb.collection("users").doc(uid).get();
    
    if (!seekerDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const seeker = { uid: seekerDoc.id, ...seekerDoc.data() } as UserProfile;
    const targetGender = seeker.gender === "male" ? "female" : seeker.gender === "female" ? "male" : undefined;

    let q = adminDb.collection("users").where("status", "==", "approved");
    
    if (targetGender) {
      q = q.where("gender", "==", targetGender);
    }
    
    q = q.orderBy("createdAt", "desc").limit(pageSize + 1);

    if (cursor) {
      const cursorDate = new Date(cursor);
      q = q.startAfter(cursorDate);
    }

    const snap = await q.get();

    // 1. Get users blocked by current seeker
    const blocksSnap = await adminDb.collection("blocks").doc(uid).collection("blockedUsers").get();
    const blockedUids = new Set(blocksSnap.docs.map(d => d.id));

    let profiles = snap.docs
      .map((d) => ({ uid: d.id, ...d.data() } as UserProfile))
      .filter((p) => p.uid !== uid && !blockedUids.has(p.uid) && !p.isPrivate);

    // 2. Filter out users who have blocked the seeker (O(1) query instead of N queries)
    const blockChecks = await adminDb.collectionGroup("blockedUsers").where("blockedUserId", "==", uid).get();
    const usersWhoBlockedSeeker = new Set(
      blockChecks.docs
        .map(doc => doc.ref.parent.parent?.id)
        .filter(Boolean)
    );
    profiles = profiles.filter(p => !usersWhoBlockedSeeker.has(p.uid));

    const hasMore = profiles.length > pageSize;
    if (hasMore) profiles = profiles.slice(0, pageSize);

    const scored = profiles.map((candidate) => {
      try {
        const { score, breakdown } = calculateCompatibility(seeker, candidate);
        return { profile: candidate, score, breakdown };
      } catch (err) {
        console.error(`Error calculating compatibility for ${candidate.uid}:`, err);
        return { profile: candidate, score: 0, breakdown: {} as any };
      }
    });

    scored.sort((a, b) => b.score - a.score);

    const lastProfile = profiles[profiles.length - 1];
    let nextCursor = null;
    if (lastProfile?.createdAt) {
      try {
        const date = (lastProfile.createdAt as any).toDate ? (lastProfile.createdAt as any).toDate() : new Date(lastProfile.createdAt as any);
        nextCursor = date.toISOString();
      } catch (err) {
        console.error("Error formatting cursor date:", err);
      }
    }

    return NextResponse.json({ matches: scored, nextCursor, hasMore });
  } catch (error: any) {
    console.error("CRITICAL ERROR in /api/matches:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

