import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";


export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);


    const { userId, title, body, data } = await req.json();
    if (!userId || !title || !body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }


    // Get user's FCM token
    const subDoc = await adminDb.collection("push_subscriptions").doc(userId).get();
    if (!subDoc.exists) {
      return NextResponse.json({ error: "User has no push subscription" }, { status: 404 });
    }


    const { fcmToken } = subDoc.data()!;


    // Check user's notification preferences
    const prefsDoc = await adminDb.collection("notification_preferences").doc(userId).get();
    const prefs = prefsDoc.exists ? prefsDoc.data() : {};


    // Check quiet hours
    if (prefs?.quietHoursStart && prefs?.quietHoursEnd) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const { quietHoursStart, quietHoursEnd } = prefs;
      let inQuietHours = false;
      if (quietHoursStart <= quietHoursEnd) {
        inQuietHours = currentTime >= quietHoursStart && currentTime <= quietHoursEnd;
      } else {
        inQuietHours = currentTime >= quietHoursStart || currentTime <= quietHoursEnd;
      }
      if (inQuietHours) {
        return NextResponse.json({ sent: false, reason: "quiet_hours" });
      }
    }


    // Send FCM message
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
      webpush: {
        headers: { Urgency: "high" },
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          vibrate: [200, 100, 200],
        },
      },
    };


    await getMessaging().send(message);


    return NextResponse.json({ sent: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}



