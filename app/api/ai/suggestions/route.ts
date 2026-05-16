import { NextRequest, NextResponse } from "next/server";
import { generateSmartSuggestions } from "@/lib/ai";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";


export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);


    // Get user profile
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }


    // Get recent activity
    const activitySnap = await adminDb
      .collection("user_interactions")
      .where("userId", "==", decoded.uid)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    const recentActivity = activitySnap.docs.map((d) => d.data().type);


    const suggestions = await generateSmartSuggestions(userDoc.data()!, recentActivity);
    return NextResponse.json({ suggestions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

