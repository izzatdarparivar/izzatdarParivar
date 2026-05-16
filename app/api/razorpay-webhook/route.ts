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


      if (uid) {
        await adminDb.doc(`users/${uid}`).update({
          is_premium: true,
          premiumActivatedAt: FieldValue.serverTimestamp(),
          premiumPaymentId: payment.id,
        });
        console.log(`Premium unlocked for user ${uid}`);
      }
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



