import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Razorpay webhook signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const uid = payment.notes?.uid as string | undefined;

      if (!uid) {
        console.error("Webhook missing UID in payment notes");
        return NextResponse.json({ error: "Missing UID" }, { status: 400 });
      }

      // Verification 1: Check payment amount (₹999 = 99900 paise)
      if (payment.amount < 99900) {
        console.error(`Webhook payment amount insufficient: ${payment.amount}`);
        return NextResponse.json({ error: "Insufficient payment amount" }, { status: 400 });
      }

      // Verification 2: Idempotency check to prevent duplicate processing
      const userRef = adminDb.doc(`users/${uid}`);
      const userDoc = await userRef.get();
      
      if (userDoc.exists && userDoc.data()?.premiumPaymentId === payment.id) {
        console.log(`Webhook idempotency hit: Payment ${payment.id} already processed for user ${uid}`);
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }

      await userRef.update({
        is_premium: true,
        premiumActivatedAt: FieldValue.serverTimestamp(),
        premiumPaymentId: payment.id,
        planTier: "gold_heritage",
      });
      console.log(`Premium unlocked successfully for user ${uid}`);
    } else if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const uid = payment.notes?.uid as string | undefined;
      
      console.warn(`Payment failed for user ${uid || "unknown"}: ${payment.error_description}`);
      await adminDb.collection("failed_payments").add({
        uid: uid || "unknown",
        paymentId: payment.id,
        amount: payment.amount,
        errorDescription: payment.error_description || "Unknown error",
        failedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
