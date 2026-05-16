import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyAdmin } from "@/lib/firebase-admin";


export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });


  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");


    let queryRef: any = adminDb.collection("reports");
    if (status) {
      queryRef = queryRef.where("status", "==", status);
    }

    const snapshot = await queryRef.limit(100).get();

    let reports = await Promise.all(
      snapshot.docs.map(async (doc: any) => {
        const data = doc.data();
        let reportedByName = "Unknown";
        let reportedUserName = "Unknown";
        try {
          const reporterDoc = await adminDb.collection("users").doc(data.reportedBy).get();
          if (reporterDoc.exists) reportedByName = reporterDoc.data()?.displayName || "Unknown";
          const reportedDoc = await adminDb.collection("users").doc(data.reportedUser).get();
          if (reportedDoc.exists) reportedUserName = reportedDoc.data()?.displayName || "Unknown";
        } catch {}
        return {
          id: doc.id,
          reportedBy: data.reportedBy,
          reportedByName,
          reportedUser: data.reportedUser,
          reportedUserName,
          reason: data.reason,
          details: data.details || "",
          status: data.status,
          createdAt: data.createdAt?.toDate?.() || new Date(0),
          createdAtStr: data.createdAt?.toDate?.()?.toLocaleDateString() || "",
        };
      })
    );

    // Sort in memory to avoid index requirements
    reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Format for response
    const formattedReports = reports.map(r => ({ ...r, createdAt: r.createdAtStr }));

    return NextResponse.json({ reports: formattedReports });
  } catch (e: any) {
    console.error("Reports GET error:", e.message);
    if (e.code === 9 || e.message.includes("index")) {
      console.error("FIREBASE INDEX REQUIRED:", e.message);
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });


  try {
    const { reportId, status, actionTaken } = await req.json();
    if (!reportId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }


    const reportRef = adminDb.collection("reports").doc(reportId);
    const reportDoc = await reportRef.get();
    if (!reportDoc.exists) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }


    await reportRef.update({
      status,
      reviewedBy: admin.uid,
      reviewedAt: new Date(),
      ...(actionTaken && { actionTaken }),
    });


    if (actionTaken?.toLowerCase().includes("suspend")) {
      const reportData = reportDoc.data()!;
      await adminDb.collection("users").doc(reportData.reportedUser).update({
        status: "suspended",
        suspendedAt: new Date(),
        suspendedBy: admin.uid,
      });
    }


    await adminDb.collection("admin_logs").add({
      action: "report_reviewed",
      reportId,
      performedBy: admin.uid,
      status,
      actionTaken: actionTaken || null,
      timestamp: new Date(),
    });


    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}



