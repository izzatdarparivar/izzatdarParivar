import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyAdmin } from "@/lib/firebase-admin";


export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });


  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limitNum = parseInt(searchParams.get("limit") || "20");


    let queryRef: any = adminDb.collection("users");
    if (status && status !== "all") {
      queryRef = queryRef.where("status", "==", status);
    }
    
    const snapshot = await queryRef.get();
    let users = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        uid: doc.id,
        displayName: data.name || data.displayName || "",
        email: data.email || "",
        status: data.status || "pending",
        role: data.role || "user",
        is_premium: data.is_premium || false,
        createdAt: data.createdAt,
        createdAtStr: data.createdAt?.toDate?.()?.toLocaleDateString() || "",
      };
    });

    // In-memory sorting (resilient to missing indexes)
    users.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    if (search) {
      const lower = search.toLowerCase();
      users = users.filter(
        (u: any) =>
          u.displayName.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      );
    }

    // Manual pagination
    const start = (page - 1) * limitNum;
    const paginatedUsers = users.slice(start, start + limitNum);
    const hasMore = users.length > start + limitNum;

    // Format output
    const finalUsers = paginatedUsers.map((u: any) => ({
      ...u,
      createdAt: u.createdAtStr
    }));

    return NextResponse.json({ users: finalUsers, hasMore });
  } catch (e: any) {
    console.error("ADMIN USERS FETCH ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}



export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });


  try {
    const { userId, updates } = await req.json();
    if (!userId || !updates) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }


    const allowedFields = ["status", "role", "is_premium"];
    const safeUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) safeUpdates[key] = value;
    }


    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }


    await adminDb.collection("users").doc(userId).update(safeUpdates);


    if (safeUpdates.role) {
      const { adminAuth } = await import("@/lib/firebase-admin");
      await adminAuth.setCustomUserClaims(userId, { role: safeUpdates.role });
    }


    await adminDb.collection("admin_logs").add({
      action: "user_updated",
      targetUser: userId,
      performedBy: admin.uid,
      updates: safeUpdates,
      timestamp: new Date(),
    });


    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

