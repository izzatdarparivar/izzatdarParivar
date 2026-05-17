import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { calculateCompatibility } from "@/lib/matching";
import { UserProfile } from "@/lib/firestore";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";
import { Redis } from "@upstash/redis";

// Check if ENV vars are set for Upstash Redis
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? Redis.fromEnv() : null;

const RecommendationsParamsSchema = z.object({
  uid: z.string().optional(),
  count: z.coerce.number().min(1).max(50).default(10),
});

export async function GET(request: NextRequest) {
  try {
    const callerUid = await requireAuth(request);
    if (!callerUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parseResult = RecommendationsParamsSchema.safeParse(Object.fromEntries(searchParams));
    
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid search parameters", details: parseResult.error.issues }, { status: 400 });
    }

    const uid = parseResult.data.uid || callerUid;
    const count = parseResult.data.count;

    if (uid !== callerUid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check Personalization Cache in Redis (1 hour TTL)
    const cacheKey = `recs:${uid}:${count}`;
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log(`Recommendations cache hit for user ${uid}`);
          const parsedCache = typeof cached === "string" ? JSON.parse(cached) : cached;
          return NextResponse.json(parsedCache);
        }
      } catch (cacheErr) {
        console.warn("Redis cache get failed:", cacheErr);
      }
    }

    const adminDb = getAdminDb();
    const seekerDoc = await adminDb.collection("users").doc(uid).get();
    
    if (!seekerDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const seeker = { uid: seekerDoc.id, ...seekerDoc.data() } as UserProfile;

    const targetGender = seeker.gender === "male" ? "female" : seeker.gender === "female" ? "male" : undefined;

    let candidatesQuery = adminDb.collection("users").where("status", "==", "approved");
    if (targetGender) candidatesQuery = candidatesQuery.where("gender", "==", targetGender);

    // Optimize: Fetch all independent Firestore queries in parallel using Promise.all
    // FIXED: Collection Name Inconsistency (blocks -> blockedUsers instead of blocked_users -> blocked)
    const [interactionsSnap, blockedSnap, candidatesSnap] = await Promise.all([
      adminDb.collection("user_interactions").where("userId", "==", uid).get(),
      adminDb.collection("blocks").doc(uid).collection("blockedUsers").get(),
      candidatesQuery.limit(200).get()
    ]);

    const seenIds = new Set(interactionsSnap.docs.map((d) => d.data().targetProfileId));
    // FIXED: Correctly mapping blockedUserId
    const blockedIds = new Set(blockedSnap.docs.map((d) => d.data().blockedUserId || d.id));

    const scored: { profile: UserProfile; score: number; breakdown: any }[] = [];
    for (const candidateDoc of candidatesSnap.docs) {
      const candidate = { uid: candidateDoc.id, ...candidateDoc.data() } as UserProfile;
      if (candidate.uid === uid) continue;
      if (seenIds.has(candidate.uid)) continue;
      if (blockedIds.has(candidate.uid)) continue;
      if (candidate.isPrivate) continue;
      
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

    const responsePayload = { 
      matches: recommendations,
      recommendations,
      generatedAt: new Date().toISOString(),
      cached: true 
    };

    // Cache the recommendations in Redis for 1 hour (3600 seconds)
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(responsePayload), { ex: 3600 });
        console.log(`Recommendations cached successfully for user ${uid}`);
      } catch (cacheSetErr) {
        console.warn("Redis cache set failed:", cacheSetErr);
      }
    }

    responsePayload.cached = false;
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("CRITICAL ERROR in /api/recommendations:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
