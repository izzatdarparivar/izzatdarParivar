import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";


const VALID_REASONS = [
  "fake_profile",
  "harassment",
  "inappropriate_content",
  "underage",
  "spam",
  "other",
] as const;

type ReportReason = (typeof VALID_REASONS)[number];


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportedBy, reportedUser, reason, details } = body as {
      reportedBy: string;
      reportedUser: string;
      reason: ReportReason;
      details?: string;
    };

    if (!reportedBy || !reportedUser || !reason) {
      return NextResponse.json(
        { error: "reportedBy, reportedUser, and reason are required" },
        { status: 400 }
      );
    }
    if (reportedBy === reportedUser) {
      return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
    }
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: `Invalid reason. Valid reasons: ${VALID_REASONS.join(", ")}` },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // Write the report
    await adminDb.collection("reports").add({
      reportedBy,
      reportedUser,
      reason,
      details: details?.trim() || "",
      status: "pending",
      createdAt: new Date(),
    });

    // Auto-suspend if 3+ active reports against this user
    const reportSnap = await adminDb
      .collection("reports")
      .where("reportedUser", "==", reportedUser)
      .where("status", "in", ["pending", "action_taken"])
      .get();

    if (reportSnap.size >= 3) {
      await adminDb.collection("users").doc(reportedUser).update({
        status: "suspended",
        suspendedAt: new Date(),
        suspendReason: `Auto-suspended: ${reportSnap.size} reports received`,
      });
      console.log(`User ${reportedUser} auto-suspended after ${reportSnap.size} reports`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in POST /api/report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
