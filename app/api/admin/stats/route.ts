import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyAdmin } from "@/lib/firebase-admin";


export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });


  try {
    const usersRef = adminDb.collection("users");
    const reportsRef = adminDb.collection("reports");


    const [allUsers, pendingUsers, pendingReports, premiumUsers] = await Promise.all([
      usersRef.count().get(),
      usersRef.where("status", "==", "pending").count().get(),
      reportsRef.where("status", "==", "pending").count().get(),
      usersRef.where("is_premium", "==", true).count().get(),
    ]);


    // Recent activity from admin_logs collection
    const logsSnap = await adminDb.collection("admin_logs")
      .orderBy("timestamp", "desc").limit(10).get();
    const recentActivity = logsSnap.docs.map((doc) => ({
      id: doc.id, ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || "",
    }));


    return NextResponse.json({
      totalUsers: allUsers.data().count,
      pendingApprovals: pendingUsers.data().count,
      activeReports: pendingReports.data().count,
      premiumUsers: premiumUsers.data().count,
      recentActivity,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

