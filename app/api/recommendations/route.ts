import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { calculateCompatibility } from "@/lib/matching";
import { UserProfile } from "@/lib/firestore";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const count = Math.min(parseInt(searchParams.get("count") || "10"), 20);

    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

    const adminDb = getAdminDb();
    const seekerDoc = await adminDb.collection("users").doc(uid).get();
    
    if (!seekerDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const seeker = { uid: seekerDoc.id, ...seekerDoc.data() } as UserProfile;

    const targetGender = seeker.gender === "male" ? "female" : seeker.gender === "female" ? "male" : undefined;

    const interactionsSnap = await adminDb.collection("user_interactions").where("userId", "==", uid).get();
    const seenIds = new Set(interactionsSnap.docs.map((d) => d.data().targetProfileId));

    const blockedSnap = await adminDb.collection("blocked_users").doc(uid).collection("blocked").get();
    const blockedIds = new Set(blockedSnap.docs.map((d) => d.id));

    let candidatesQuery = adminDb.collection("users").where("status", "==", "approved");
    if (targetGender) candidatesQuery = candidatesQuery.where("gender", "==", targetGender);

    const candidatesSnap = await candidatesQuery.limit(200).get();

    const scored: { profile: UserProfile; score: number; breakdown: any }[] = [];
    for (const candidateDoc of candidatesSnap.docs) {
      const candidate = { uid: candidateDoc.id, ...candidateDoc.data() } as UserProfile;
      if (candidate.uid === uid) continue;
      if (seenIds.has(candidate.uid)) continue;
      if (blockedIds.has(candidate.uid)) continue;
      
      try {
        const { score, breakdown } = calculateCompatibility(seeker, candidate);
        scored.push({ profile: candidate, score, breakdown });
      } catch (err) {
        console.error(`Error in recommendations for candidate ${candidate.uid}:`, err);
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const recommendations = scored.slice(0, count).map(s => ({
      profile: s.profile,
      score: s.score,
      breakdown: s.breakdown
    }));

    return NextResponse.json({ 
      matches: recommendations, // Changed to 'matches' to match the frontend expectation
      recommendations, // Keeping for backward compatibility
      generatedAt: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("CRITICAL ERROR in /api/recommendations:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}

